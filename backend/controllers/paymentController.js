const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const APIFeatures = require('../utils/apiFeatures');
const logActivity = require('../utils/activityLogger');
const { computeBookingStatus } = require('../utils/bookingStatus');

// @desc Get payment analytics (totals, mode breakdown, monthly trend) —
// overall AND broken down separately by Invoice / Booking / Employee Payment
// @route GET /api/payments/analytics
exports.getPaymentAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // One $facet aggregation per module (Invoice/Booking = money in, EmployeePayment
  // = money out) so every part of the breakdown — total, this month, last month,
  // payment-mode split, and a 6-month trend — comes back in a single query per module.
  async function moduleStats(moduleName) {
    const [result] = await Payment.aggregate([
      { $match: { module: moduleName } },
      {
        $facet: {
          total: [{ $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }],
          thisMonth: [
            { $match: { paidOn: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
          ],
          lastMonth: [
            { $match: { paidOn: { $gte: startOfLastMonth, $lt: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
          ],
          byMode: [
            { $group: { _id: '$mode', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { total: -1 } },
          ],
          monthly: [
            { $match: { paidOn: { $gte: sixMonthsAgo } } },
            {
              $group: {
                _id: { year: { $year: '$paidOn' }, month: { $month: '$paidOn' } },
                total: { $sum: '$amount' },
              },
            },
          ],
        },
      },
    ]);

    const total = result.total[0]?.total || 0;
    const count = result.total[0]?.count || 0;
    const thisMonth = result.thisMonth[0]?.total || 0;
    const lastMonth = result.lastMonth[0]?.total || 0;
    const momChangePercent = lastMonth > 0 ? +(((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : null;

    return {
      total: +total.toFixed(2),
      count,
      thisMonth: +thisMonth.toFixed(2),
      lastMonth: +lastMonth.toFixed(2),
      momChangePercent,
      avgAmount: count > 0 ? +(total / count).toFixed(2) : 0,
      byMode: result.byMode.map((m) => ({ mode: m._id, total: +m.total.toFixed(2), count: m.count })),
      monthlyRaw: result.monthly, // consumed below to build the 6-month series, not returned as-is
    };
  }

  const [invoiceStats, bookingStats, employeePaymentStats, pendingInvoices, statusBreakdownAgg] = await Promise.all([
    moduleStats('Invoice'),
    moduleStats('Booking'),
    moduleStats('EmployeePayment'),
    Invoice.find({ status: { $in: ['Draft', 'Sent', 'Partially Paid', 'Overdue'] } }),
    Invoice.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amountPayable' } } }]),
  ]);

  // Build a 6-month series per module so the frontend can render a stacked
  // chart (Invoice vs Booking vs Employee Payment) alongside the combined one.
  function seriesFor(stats) {
    const series = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const match = stats.monthlyRaw.find((m) => m._id.year === d.getFullYear() && m._id.month === d.getMonth() + 1);
      series.push(+((match?.total) || 0).toFixed(2));
    }
    return series;
  }
  const monthLabels = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
  }
  const invoiceSeries = seriesFor(invoiceStats);
  const bookingSeries = seriesFor(bookingStats);
  const employeePaymentSeries = seriesFor(employeePaymentStats);

  const monthlyTrendByModule = monthLabels.map((month, i) => ({
    month,
    Invoice: invoiceSeries[i],
    Booking: bookingSeries[i],
    EmployeePayment: employeePaymentSeries[i],
  }));
  // Combined "money in" trend (Invoice + Booking), same shape the dashboard already uses
  const monthlyTrend = monthLabels.map((month, i) => ({
    month,
    total: +(invoiceSeries[i] + bookingSeries[i]).toFixed(2),
  }));

  const totalCollected = +(invoiceStats.total + bookingStats.total).toFixed(2);
  const thisMonthCollected = +(invoiceStats.thisMonth + bookingStats.thisMonth).toFixed(2);
  const lastMonthCollected = +(invoiceStats.lastMonth + bookingStats.lastMonth).toFixed(2);
  const momChangePercent = lastMonthCollected > 0
    ? +(((thisMonthCollected - lastMonthCollected) / lastMonthCollected) * 100).toFixed(1)
    : null;
  const transactionCount = invoiceStats.count + bookingStats.count;
  const totalPaidOut = employeePaymentStats.total;

  const totalPending = +pendingInvoices
    .reduce((sum, inv) => sum + Math.max(0, inv.amountPayable - inv.amountPaid), 0)
    .toFixed(2);
  const overdueCount = pendingInvoices.filter((inv) => inv.status === 'Overdue').length;

  // Combined mode breakdown across Invoice + Booking (money in only — matches
  // what "modeBreakdown" meant before this endpoint was split by module)
  const combinedModeMap = new Map();
  [...invoiceStats.byMode, ...bookingStats.byMode].forEach(({ mode, total, count }) => {
    const existing = combinedModeMap.get(mode) || { mode, total: 0, count: 0 };
    existing.total = +(existing.total + total).toFixed(2);
    existing.count += count;
    combinedModeMap.set(mode, existing);
  });
  const modeBreakdown = [...combinedModeMap.values()].sort((a, b) => b.total - a.total);

  const strip = ({ monthlyRaw, ...rest }) => rest; // don't leak the raw mongo grouping shape

  res.json({
    success: true,
    data: {
      // Overall — money in (Invoice + Booking) vs money out (Employee Payments)
      totalCollected,
      thisMonthCollected,
      lastMonthCollected,
      momChangePercent,
      totalPending,
      overdueCount,
      transactionCount,
      totalPaidOut,
      netCashFlow: +(totalCollected - totalPaidOut).toFixed(2),
      avgPaymentAmount: transactionCount > 0 ? +(totalCollected / transactionCount).toFixed(2) : 0,
      modeBreakdown,
      monthlyTrend,

      // Each separate part, broken down identically
      byModule: {
        Invoice: strip(invoiceStats),
        Booking: strip(bookingStats),
        EmployeePayment: strip(employeePaymentStats),
      },
      monthlyTrendByModule,
      invoiceStatusBreakdown: statusBreakdownAgg.map((s) => ({
        status: s._id,
        count: s.count,
        total: +s.total.toFixed(2),
      })),
    },
  });
});

// @desc Get all payments (search/filter/sort/paginate)
// @route GET /api/payments
exports.getPayments = asyncHandler(async (req, res) => {
  const features = new APIFeatures(
    Payment.find()
      .populate('invoice', 'invoiceNumber total amountPayable')
      .populate('customer', 'name email')
      .populate('employee', 'name designation')
      .populate('booking', 'couponId')
      .populate('employeePayment', 'payslipNumber'),
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

// @desc Record a payment against an invoice OR a booking coupon —
// pass exactly one of `invoice` / `booking` in the body. Every payment is
// its own Payment record (never overwritten), same pattern for both, so
// bookings get proper incremental payment history like invoices do.
// @route POST /api/payments
exports.createPayment = asyncHandler(async (req, res) => {
  const { invoice: invoiceId, booking: bookingId, amount, mode, referenceNo, paidOn, notes } = req.body;

  if (bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    const payment = await Payment.create({
      module: 'Booking',
      direction: 'in',
      booking: booking._id,
      customer: booking.customer || undefined,
      partyName: booking.clientName,
      reference: booking.couponId,
      amount,
      mode,
      referenceNo,
      paidOn,
      notes,
      recordedBy: req.user._id,
    });

    const newPaid = Math.min(booking.bookingAmount, +(booking.amountPaid + Number(amount)).toFixed(2));
    const { balance, status } = computeBookingStatus(booking.bookingAmount, newPaid);
    booking.amountPaid = newPaid;
    booking.balanceAmount = balance;
    booking.paymentStatus = status;
    await booking.save();

    await logActivity({
      user: req.user,
      action: 'CREATE',
      module: 'Payment',
      description: `Recorded payment of ₹${amount} for booking ${booking.couponId}`,
      entityId: payment._id,
      req,
    });

    return res.status(201).json({ success: true, data: payment });
  }

  const invoice = await Invoice.findById(invoiceId).populate('customer', 'name');
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  const payment = await Payment.create({
    module: 'Invoice',
    direction: 'in',
    invoice: invoice._id,
    customer: invoice.customer?._id || invoice.customer,
    partyName: invoice.customer?.name || invoice.customerSnapshot?.name,
    reference: invoice.invoiceNumber,
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

// @desc Update payment record (works for invoice- or booking-linked payments)
// @route PUT /api/payments/:id
exports.updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  if (payment.module === 'Booking') {
    const booking = await Booking.findById(payment.booking);
    if (booking && req.body.amount !== undefined) {
      const reverted = +(booking.amountPaid - payment.amount).toFixed(2);
      const newPaid = Math.max(0, Math.min(booking.bookingAmount, +(reverted + Number(req.body.amount)).toFixed(2)));
      const { balance, status } = computeBookingStatus(booking.bookingAmount, newPaid);
      booking.amountPaid = newPaid;
      booking.balanceAmount = balance;
      booking.paymentStatus = status;
      await booking.save();
    }

    Object.assign(payment, req.body);
    await payment.save();

    await logActivity({
      user: req.user,
      action: 'UPDATE',
      module: 'Payment',
      description: `Updated payment for booking ${booking ? booking.couponId : ''}`,
      entityId: payment._id,
      req,
    });

    return res.json({ success: true, data: payment });
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

// @desc Delete a payment (reverses amount on the invoice or booking it belongs to)
// @route DELETE /api/payments/:id
exports.deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  if (payment.module === 'Booking') {
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      const newPaid = Math.max(0, +(booking.amountPaid - payment.amount).toFixed(2));
      const { balance, status } = computeBookingStatus(booking.bookingAmount, newPaid);
      booking.amountPaid = newPaid;
      booking.balanceAmount = balance;
      booking.paymentStatus = status;
      await booking.save();
    }

    await logActivity({
      user: req.user,
      action: 'DELETE',
      module: 'Payment',
      description: `Deleted payment of ₹${payment.amount}`,
      entityId: payment._id,
      req,
    });

    return res.json({ success: true, message: 'Payment deleted and booking balance reversed' });
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