const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Settings = require('../models/Settings');
const Payment = require('../models/Payment');
const APIFeatures = require('../utils/apiFeatures');
const logActivity = require('../utils/activityLogger');
const generateBookingPDF = require('../utils/bookingPdfGenerator');
const fetchImageBuffer = require('../utils/fetchImageBuffer');
const { computeBookingStatus } = require('../utils/bookingStatus');
const resolveCustomer = require('../utils/resolveCustomer');
const { getNextCouponId } = require('../utils/bookingService');
const { createInvoiceRecord } = require('../utils/invoiceService');

async function withImageBuffers(settingsDoc) {
  const settings = settingsDoc.toObject ? settingsDoc.toObject() : { ...settingsDoc };
  const logoBuffer = await fetchImageBuffer(settings.logo?.url);
  if (logoBuffer) settings.logoBuffer = logoBuffer;
  return settings;
}

// @desc Get all bookings
// @route GET /api/bookings
exports.getBookings = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Booking.find(), req.query)
    .search(['couponId', 'clientName', 'mobile'])
    .filter()
    .sort()
    .paginate();

  const queryObj = { ...req.query };
  ['search', 'sort', 'page', 'limit', 'fields'].forEach((f) => delete queryObj[f]);

  const [bookings, total] = await Promise.all([features.query, Booking.countDocuments(queryObj)]);

  res.json({
    success: true,
    count: bookings.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: bookings,
  });
});

// @desc Get single booking
// @route GET /api/bookings/:id
exports.getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  res.json({ success: true, data: booking });
});

// @desc Create booking coupon. Client is the same Customer used for
// invoices — pass either an existing customer's id, or an inline
// { name, phone, email?, gstin? } object for a new one (e.g. a friend,
// no GST needed). `amountPaid`, if given, is recorded as the first
// payment (e.g. a token/advance collected at booking time) — it goes
// through the same Payment ledger as any later payment, not a raw field set.
// @route POST /api/bookings
exports.createBooking = asyncHandler(async (req, res) => {
  const {
    customer: customerInput, serviceType, shootDate, shootLocation,
    bookingAmount, amountPaid, paymentMode, transactionRef, authorizedBy,
    notes, bookingDate,
  } = req.body;

  const customer = await resolveCustomer(customerInput, req, res, 'a booking');

  const { couponId } = await getNextCouponId();
  const amount = Number(bookingAmount) || 0;
  const initialPaid = Math.min(Number(amountPaid) || 0, amount);

  const booking = await Booking.create({
    couponId,
    bookingDate: bookingDate || Date.now(),
    clientName: customer.name,
    mobile: customer.phone,
    email: customer.email,
    serviceType, shootDate, shootLocation,
    bookingAmount: amount,
    amountPaid: 0,
    balanceAmount: amount,
    paymentStatus: 'Unpaid',
    paymentMode, transactionRef, authorizedBy, notes,
    customer: customer._id,
    createdBy: req.user._id,
  });

  await logActivity({
    user: req.user,
    action: 'CREATE',
    module: 'Booking',
    description: `Created booking coupon: ${booking.couponId}`,
    entityId: booking._id,
    req,
  });

  if (initialPaid > 0) {
    await Payment.create({
      module: 'Booking',
      direction: 'in',
      booking: booking._id,
      customer: booking.customer || undefined,
      partyName: booking.clientName,
      reference: booking.couponId,
      amount: initialPaid,
      mode: paymentMode,
      referenceNo: transactionRef,
      paidOn: booking.bookingDate,
      recordedBy: req.user._id,
    });

    const { balance, status } = computeBookingStatus(booking.bookingAmount, initialPaid);
    booking.amountPaid = initialPaid;
    booking.balanceAmount = balance;
    booking.paymentStatus = status;
    await booking.save();
  }

  res.status(201).json({ success: true, data: booking });
});

// @desc Update booking coupon details (NOT payments — use POST /api/payments
// with { booking: id, amount } to record additional payments, same as
// invoices; this keeps every payment as its own auditable Payment record
// instead of one field silently overwritten on every edit).
// @route PUT /api/bookings/:id
exports.updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (req.body.customer !== undefined) {
    const customer = await resolveCustomer(req.body.customer, req, res, 'a booking');
    booking.customer = customer._id;
    booking.clientName = customer.name;
    booking.mobile = customer.phone;
    booking.email = customer.email;
  }

  const fields = [
    'serviceType', 'shootDate', 'shootLocation',
    'bookingAmount', 'paymentMode', 'transactionRef', 'authorizedBy',
    'notes', 'bookingDate',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) booking[f] = req.body[f];
  });

  // bookingAmount may have changed — recompute balance/status against the
  // (unchanged) amountPaid, clamped so it can never go negative.
  const { balance, status } = computeBookingStatus(booking.bookingAmount, booking.amountPaid);
  booking.balanceAmount = balance;
  booking.paymentStatus = status;

  await booking.save();

  await logActivity({
    user: req.user,
    action: 'UPDATE',
    module: 'Booking',
    description: `Updated booking coupon: ${booking.couponId}`,
    entityId: booking._id,
    req,
  });

  res.json({ success: true, data: booking });
});

// @desc Delete booking coupon (and every payment recorded against it)
// @route DELETE /api/bookings/:id
exports.deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  await Payment.deleteMany({ module: 'Booking', booking: booking._id });
  await logActivity({
    user: req.user,
    action: 'DELETE',
    module: 'Booking',
    description: `Deleted booking coupon: ${booking.couponId}`,
    entityId: booking._id,
    req,
  });
  res.json({ success: true, message: 'Booking deleted successfully' });
});

// @desc Stream/download booking coupon PDF (preview + download + print) — staff only
// @route GET /api/bookings/:id/pdf
exports.getBookingPDF = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const settingsDoc = (await Settings.findOne()) || {};
  const settings = await withImageBuffers(settingsDoc);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${booking.couponId}.pdf`);

  await generateBookingPDF({ settings, booking }, res);
});

// @desc Get (or create) a public share link for this booking coupon —
// anyone with the link can view/download the PDF, no login required.
// @route POST /api/bookings/:id/share
exports.getBookingShareLink = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (!booking.shareToken) {
    booking.shareToken = crypto.randomBytes(16).toString('hex');
    await booking.save();
  }
  const base = `${req.protocol}://${req.get('host')}`;
  res.json({ success: true, url: `${base}/api/public/bookings/${booking.shareToken}/pdf` });
});

// @desc Public (no-auth) booking coupon PDF, via share token
// @route GET /api/public/bookings/:token/pdf
exports.getPublicBookingPDF = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ shareToken: req.params.token });
  if (!booking) {
    res.status(404);
    throw new Error('Link not found or expired');
  }
  const settingsDoc = (await Settings.findOne()) || {};
  const settings = await withImageBuffers(settingsDoc);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${booking.couponId}.pdf`);

  await generateBookingPDF({ settings, booking }, res);
});

// @desc Convert a booking coupon into a GST invoice for the same client —
// e.g. the client initially didn't need GST, now wants a formal bill for
// this same job. The booking's already-collected payment(s) MOVE to the
// new invoice (never re-entered/duplicated), and the booking is marked
// Converted + locked so it can't be edited or paid separately afterward.
// @route POST /api/bookings/:id/convert
exports.convertBookingToInvoice = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.convertedToInvoice) {
    res.status(400);
    throw new Error('This booking has already been converted to an invoice');
  }

  const customer = await Customer.findById(booking.customer);
  if (!customer) {
    res.status(404);
    throw new Error('The customer linked to this booking no longer exists');
  }

  const { items, invoiceDate, dueDate, placeOfSupply, tdsPercent, notes } = req.body;

  // Default to one line item carrying the booking's amount forward —
  // staff can edit/split it (e.g. into base + GST) before this is called,
  // since the frontend pre-fills this from the booking and lets them adjust it.
  const invoiceItems = items && items.length ? items : [
    { item: booking.serviceType, rate: booking.bookingAmount, qty: 1, taxPercent: 0 },
  ];

  const invoice = await createInvoiceRecord({
    customer,
    items: invoiceItems,
    invoiceDate,
    dueDate,
    placeOfSupply,
    tdsPercent,
    notes: notes || booking.notes,
    sourceBooking: booking._id,
    createdBy: req.user._id,
  });

  // Move every payment already recorded against the booking onto the new
  // invoice — same money, not re-entered, not duplicated.
  await Payment.updateMany(
    { module: 'Booking', booking: booking._id },
    { $set: { module: 'Invoice', invoice: invoice._id, reference: invoice.invoiceNumber }, $unset: { booking: '' } }
  );

  const paidAgg = await Payment.aggregate([
    { $match: { module: 'Invoice', invoice: invoice._id } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const transferredPaid = Math.min(invoice.amountPayable, paidAgg[0]?.total || 0);
  invoice.amountPaid = transferredPaid;
  invoice.status = transferredPaid >= invoice.amountPayable && invoice.amountPayable > 0
    ? 'Paid'
    : transferredPaid > 0 ? 'Partially Paid' : 'Draft';
  await invoice.save();

  booking.convertedToInvoice = invoice._id;
  booking.convertedAt = new Date();
  await booking.save();

  await logActivity({
    user: req.user,
    action: 'CREATE',
    module: 'Invoice',
    description: `Converted booking ${booking.couponId} to invoice ${invoice.invoiceNumber}`,
    entityId: invoice._id,
    req,
  });

  res.status(201).json({ success: true, data: invoice });
});
