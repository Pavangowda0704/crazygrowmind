const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const APIFeatures = require('../utils/apiFeatures');
const logActivity = require('../utils/activityLogger');

// @desc Get payment analytics (totals, mode breakdown, monthly trend)
// @route GET /api/payments/analytics
exports.getPaymentAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalsAgg,
    thisMonthAgg,
    lastMonthAgg,
    modeBreakdown,
    monthlyTrendRaw,
    pendingInvoices,
    transactionCount,
  ] = await Promise.all([
    Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([
      { $match: { paidOn: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $match: { paidOn: { $gte: startOfLastMonth, $lt: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $group: { _id: '$mode', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Payment.aggregate([
      { $match: { paidOn: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$paidOn' }, month: { $month: '$paidOn' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Invoice.find({ status: { $in: ['Draft', 'Sent', 'Partially Paid', 'Overdue'] } }),
    Payment.countDocuments(),
  ]);

  const totalCollected = totalsAgg[0]?.total || 0;
  const thisMonthCollected = thisMonthAgg[0]?.total || 0;
  const lastMonthCollected = lastMonthAgg[0]?.total || 0;
  const momChangePercent = lastMonthCollected > 0
    ? +(((thisMonthCollected - lastMonthCollected) / lastMonthCollected) * 100).toFixed(1)
    : null;

  const totalPending = +pendingInvoices
    .reduce((sum, inv) => sum + Math.max(0, inv.amountPayable - inv.amountPaid), 0)
    .toFixed(2);

  const overdueCount = pendingInvoices.filter((inv) => inv.status === 'Overdue').length;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Ensure all 6 months appear even if a month had zero collections
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const match = monthlyTrendRaw.find(
      (m) => m._id.year === d.getFullYear() && m._id.month === d.getMonth() + 1
    );
    monthlyTrend.push({
      month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      total: match ? +match.total.toFixed(2) : 0,
    });
  }

  res.json({
    success: true,
    data: {
      totalCollected,
      thisMonthCollected,
      lastMonthCollected,
      momChangePercent,
      totalPending,
      overdueCount,
      transactionCount,
      avgPaymentAmount: transactionCount > 0 ? +(totalCollected / transactionCount).toFixed(2) : 0,
      modeBreakdown: modeBreakdown.map((m) => ({ mode: m._id, total: +m.total.toFixed(2), count: m.count })),
      monthlyTrend,
    },
  });
});

// @desc Get all payments (search/filter/sort/paginate)
// @route GET /api/payments
exports.getPayments = asyncHandler(async (req, res) => {
  const features = new APIFeatures(
    Payment.find().populate('invoice', 'invoiceNumber total amountPayable').populate('customer', 'name email'),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const queryObj = { ...req.query };
  ['search', 'sort', 'page', 'limit', 'fields'].forEach((f) => delete queryObj[f]);

  const [payments, total] = await Promise.all([features.query, Payment.countDocuments(queryObj)]);

  res.json({
    success: true,
    count: payments.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: payments,
  });
});

// @desc Get pending payments (invoices not fully paid)
// @route GET /api/payments/pending
exports.getPendingPayments = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({
    status: { $in: ['Draft', 'Sent', 'Partially Paid', 'Overdue'] },
  })
    .populate('customer', 'name email phone')
    .sort('-dueDate');

  const pending = invoices
    .map((inv) => ({
      _id: inv._id,
      invoiceNumber: inv.invoiceNumber,
      customer: inv.customer,
      dueDate: inv.dueDate,
      total: inv.total,
      amountPaid: inv.amountPaid,
      pendingAmount: +(inv.amountPayable - inv.amountPaid).toFixed(2),
      status: inv.status,
    }))
    .filter((inv) => inv.pendingAmount > 0);

  res.json({ success: true, count: pending.length, data: pending });
});

// @desc Record a payment against an invoice
// @route POST /api/payments
exports.createPayment = asyncHandler(async (req, res) => {
  const { invoice: invoiceId, amount, mode, referenceNo, paidOn, notes } = req.body;

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  const payment = await Payment.create({
    invoice: invoice._id,
    customer: invoice.customer,
    amount,
    mode,
    referenceNo,
    paidOn,
    notes,
    recordedBy: req.user._id,
  });

  invoice.amountPaid = +(invoice.amountPaid + Number(amount)).toFixed(2);
  const remaining = +(invoice.amountPayable - invoice.amountPaid).toFixed(2);
  if (remaining <= 0) {
    invoice.status = 'Paid';
  } else if (invoice.amountPaid > 0) {
    invoice.status = 'Partially Paid';
  }
  await invoice.save();

  await logActivity({
    user: req.user,
    action: 'CREATE',
    module: 'Payment',
    description: `Recorded payment of ₹${amount} for invoice ${invoice.invoiceNumber}`,
    entityId: payment._id,
    req,
  });

  res.status(201).json({ success: true, data: payment });
});

// @desc Get single payment
// @route GET /api/payments/:id
exports.getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('invoice').populate('customer', 'name email');
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  res.json({ success: true, data: payment });
});

// @desc Update payment record
// @route PUT /api/payments/:id
exports.updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  const invoice = await Invoice.findById(payment.invoice);
  if (invoice && req.body.amount !== undefined) {
    // Reverse old amount, apply new
    invoice.amountPaid = +(invoice.amountPaid - payment.amount + Number(req.body.amount)).toFixed(2);
    const remaining = +(invoice.amountPayable - invoice.amountPaid).toFixed(2);
    invoice.status = remaining <= 0 ? 'Paid' : invoice.amountPaid > 0 ? 'Partially Paid' : 'Sent';
    await invoice.save();
  }

  Object.assign(payment, req.body);
  await payment.save();

  await logActivity({
    user: req.user,
    action: 'UPDATE',
    module: 'Payment',
    description: `Updated payment for invoice ${invoice ? invoice.invoiceNumber : ''}`,
    entityId: payment._id,
    req,
  });

  res.json({ success: true, data: payment });
});

// @desc Delete a payment (reverses amount on invoice)
// @route DELETE /api/payments/:id
exports.deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  const invoice = await Invoice.findById(payment.invoice);
  if (invoice) {
    invoice.amountPaid = Math.max(0, +(invoice.amountPaid - payment.amount).toFixed(2));
    invoice.status = invoice.amountPaid <= 0 ? 'Sent' : 'Partially Paid';
    await invoice.save();
  }

  await logActivity({
    user: req.user,
    action: 'DELETE',
    module: 'Payment',
    description: `Deleted payment of ₹${payment.amount}`,
    entityId: payment._id,
    req,
  });

  res.json({ success: true, message: 'Payment deleted and invoice balance reversed' });
});