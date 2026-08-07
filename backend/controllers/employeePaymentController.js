const asyncHandler = require('express-async-handler');
const EmployeePayment = require('../models/EmployeePayment');
const Employee = require('../models/Employee');
const Settings = require('../models/Settings');
const Payment = require('../models/Payment');
const APIFeatures = require('../utils/apiFeatures');
const logActivity = require('../utils/activityLogger');
const generateEmployeePaymentPDF = require('../utils/employeePaymentPdfGenerator');
const { amountInWords } = require('../utils/numberToWords');
const fetchImageBuffer = require('../utils/fetchImageBuffer');

async function withImageBuffers(settingsDoc) {
  const settings = settingsDoc.toObject ? settingsDoc.toObject() : { ...settingsDoc };
  const [logoBuffer, signatureBuffer] = await Promise.all([
    fetchImageBuffer(settings.logo?.url),
    fetchImageBuffer(settings.signature?.url),
  ]);
  if (logoBuffer) settings.logoBuffer = logoBuffer;
  if (signatureBuffer) settings.signatureBuffer = signatureBuffer;
  return settings;
}

async function getNextPayslipNumber() {
  const settings = (await Settings.findOne()) || (await Settings.create({}));
  const count = await EmployeePayment.countDocuments();
  const number = (settings.payslipStartNumber || 1) + count;
  return { payslipNumber: `${settings.payslipPrefix || 'CGM-EMP-'}${number}`, settings };
}

function computeNet(items) {
  const computedItems = items.map((it) => ({
    description: it.description,
    amount: +(Number(it.amount) || 0).toFixed(2),
  }));
  const netAmount = +computedItems.reduce((s, i) => s + i.amount, 0).toFixed(2);
  return { computedItems, netAmount };
}

// Keeps a linked Payment record (direction: 'out') in sync with the payslip,
// so salary payouts show up on the unified Payments page/reports as an
// outgoing activity — same ledger as invoices/bookings, opposite direction.
async function syncEmployeePaymentRecord(payment, userId) {
  const existing = await Payment.findOne({ module: 'EmployeePayment', employeePayment: payment._id });
  const data = {
    module: 'EmployeePayment',
    direction: 'out',
    employeePayment: payment._id,
    employee: payment.employee,
    partyName: payment.employeeSnapshot?.name,
    reference: payment.payslipNumber,
    amount: payment.netAmount,
    mode: payment.paymentMode,
    referenceNo: payment.referenceNo,
    paidOn: payment.paymentDate,
    notes: payment.notes,
  };
  if (existing) {
    Object.assign(existing, data);
    await existing.save();
  } else {
    await Payment.create({ ...data, recordedBy: userId });
  }
}

// @desc Get all employee payments
// @route GET /api/employee-payments
exports.getEmployeePayments = asyncHandler(async (req, res) => {
  const features = new APIFeatures(EmployeePayment.find().populate('employee', 'name designation phone'), req.query)
    .search(['payslipNumber', 'period'])
    .filter()
    .sort()
    .paginate();

  const queryObj = { ...req.query };
  ['search', 'sort', 'page', 'limit', 'fields'].forEach((f) => delete queryObj[f]);

  const [payments, total] = await Promise.all([features.query, EmployeePayment.countDocuments(queryObj)]);

  res.json({
    success: true,
    count: payments.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: payments,
  });
});

// @desc Get single employee payment
// @route GET /api/employee-payments/:id
exports.getEmployeePayment = asyncHandler(async (req, res) => {
  const payment = await EmployeePayment.findById(req.params.id).populate('employee');
  if (!payment) {
    res.status(404);
    throw new Error('Employee payment not found');
  }
  res.json({ success: true, data: payment });
});

// @desc Create employee payment (payslip)
// @route POST /api/employee-payments
exports.createEmployeePayment = asyncHandler(async (req, res) => {
  const { employee: employeeId, period, paymentDate, items, paymentMode, referenceNo, status, notes } = req.body;

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  const { payslipNumber } = await getNextPayslipNumber();
  const { computedItems, netAmount } = computeNet(items && items.length ? items : [
    { description: 'Basic Salary', amount: employee.monthlySalary || 0 },
  ]);

  const payment = await EmployeePayment.create({
    payslipNumber,
    employee: employee._id,
    employeeSnapshot: {
      name: employee.name,
      designation: employee.designation,
      phone: employee.phone,
      email: employee.email,
      bankDetails: employee.bankDetails,
    },
    period,
    paymentDate: paymentDate || Date.now(),
    items: computedItems,
    netAmount,
    amountInWords: amountInWords(netAmount),
    paymentMode,
    referenceNo,
    status: status || 'Paid',
    notes,
    createdBy: req.user._id,
  });

  await logActivity({
    user: req.user,
    action: 'CREATE',
    module: 'EmployeePayment',
    description: `Created employee payslip: ${payment.payslipNumber} for ${employee.name}`,
    entityId: payment._id,
    req,
  });

  await syncEmployeePaymentRecord(payment, req.user._id);

  res.status(201).json({ success: true, data: payment });
});

// @desc Update employee payment
// @route PUT /api/employee-payments/:id
exports.updateEmployeePayment = asyncHandler(async (req, res) => {
  const payment = await EmployeePayment.findById(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error('Employee payment not found');
  }

  const { items, period, paymentDate, paymentMode, referenceNo, status, notes } = req.body;

  if (items) {
    const { computedItems, netAmount } = computeNet(items);
    payment.items = computedItems;
    payment.netAmount = netAmount;
    payment.amountInWords = amountInWords(netAmount);
  }
  if (period !== undefined) payment.period = period;
  if (paymentDate) payment.paymentDate = paymentDate;
  if (paymentMode) payment.paymentMode = paymentMode;
  if (referenceNo !== undefined) payment.referenceNo = referenceNo;
  if (status) payment.status = status;
  if (notes !== undefined) payment.notes = notes;

  await payment.save();

  await logActivity({
    user: req.user,
    action: 'UPDATE',
    module: 'EmployeePayment',
    description: `Updated employee payslip: ${payment.payslipNumber}`,
    entityId: payment._id,
    req,
  });

  await syncEmployeePaymentRecord(payment, req.user._id);

  res.json({ success: true, data: payment });
});

// @desc Delete employee payment
// @route DELETE /api/employee-payments/:id
exports.deleteEmployeePayment = asyncHandler(async (req, res) => {
  const payment = await EmployeePayment.findByIdAndDelete(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error('Employee payment not found');
  }
  await Payment.deleteOne({ module: 'EmployeePayment', employeePayment: payment._id });
  await logActivity({
    user: req.user,
    action: 'DELETE',
    module: 'EmployeePayment',
    description: `Deleted employee payslip: ${payment.payslipNumber}`,
    entityId: payment._id,
    req,
  });
  res.json({ success: true, message: 'Employee payment deleted successfully' });
});

// @desc Stream/download employee payment PDF (preview + download + print)
// @route GET /api/employee-payments/:id/pdf
exports.getEmployeePaymentPDF = asyncHandler(async (req, res) => {
  const payment = await EmployeePayment.findById(req.params.id).populate('employee');
  if (!payment) {
    res.status(404);
    throw new Error('Employee payment not found');
  }
  const settingsDoc = (await Settings.findOne()) || {};
  const settings = await withImageBuffers(settingsDoc);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${payment.payslipNumber}.pdf`);

  generateEmployeePaymentPDF({ settings, payment }, res);
});
