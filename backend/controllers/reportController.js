const asyncHandler = require('express-async-handler');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

function dateRangeFilter(req, field = 'createdAt') {
  const { from, to } = req.query;
  const filter = {};
  if (from || to) {
    filter[field] = {};
    if (from) filter[field].$gte = new Date(from);
    if (to) filter[field].$lte = new Date(to);
  }
  return filter;
}

// @desc Revenue report (money received — invoices + booking coupons; excludes employee payouts)
// @route GET /api/reports/revenue
exports.revenueReport = asyncHandler(async (req, res) => {
  const filter = { ...dateRangeFilter(req, 'paidOn'), direction: 'in' };
  const payments = await Payment.find(filter).populate('customer', 'name').populate('invoice', 'invoiceNumber');
  const total = +payments.reduce((s, p) => s + p.amount, 0).toFixed(2);
  res.json({ success: true, total, count: payments.length, data: payments });
});

// @desc Leads report
// @route GET /api/reports/leads
exports.leadsReport = asyncHandler(async (req, res) => {
  const filter = dateRangeFilter(req);
  const leads = await Lead.find(filter).populate('assignedTo', 'name');
  const byStatus = await Lead.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
  res.json({ success: true, count: leads.length, byStatus, data: leads });
});

// @desc Customers report
// @route GET /api/reports/customers
exports.customersReport = asyncHandler(async (req, res) => {
  const filter = dateRangeFilter(req);
  const customers = await Customer.find(filter);
  res.json({ success: true, count: customers.length, data: customers });
});

// @desc Services report (with usage count in invoices)
// @route GET /api/reports/services
exports.servicesReport = asyncHandler(async (req, res) => {
  const services = await Service.find();
  const usage = await Invoice.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.item', totalAmount: { $sum: '$items.amount' }, count: { $sum: 1 } } },
    { $sort: { totalAmount: -1 } },
  ]);
  res.json({ success: true, count: services.length, data: services, usage });
});

// @desc Invoices report
// @route GET /api/reports/invoices
exports.invoicesReport = asyncHandler(async (req, res) => {
  const filter = dateRangeFilter(req, 'invoiceDate');
  const invoices = await Invoice.find(filter).populate('customer', 'name');
  const totalValue = +invoices.reduce((s, i) => s + i.total, 0).toFixed(2);
  const byStatus = await Invoice.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$total' } } }]);
  res.json({ success: true, count: invoices.length, totalValue, byStatus, data: invoices });
});

// @desc Payments report — every payment activity (invoices, bookings, employee payouts)
// @route GET /api/reports/payments
exports.paymentsReport = asyncHandler(async (req, res) => {
  const filter = dateRangeFilter(req, 'paidOn');
  const payments = await Payment.find(filter)
    .populate('customer', 'name')
    .populate('invoice', 'invoiceNumber')
    .populate('employee', 'name')
    .populate('booking', 'couponId')
    .populate('employeePayment', 'payslipNumber');
  const byMode = await Payment.aggregate([{ $match: filter }, { $group: { _id: '$mode', total: { $sum: '$amount' }, count: { $sum: 1 } } }]);
  const totalIn = +payments.filter((p) => p.direction === 'in').reduce((s, p) => s + p.amount, 0).toFixed(2);
  const totalOut = +payments.filter((p) => p.direction === 'out').reduce((s, p) => s + p.amount, 0).toFixed(2);
  res.json({ success: true, count: payments.length, byMode, totalIn, totalOut, data: payments });
});
