const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Settings = require('../models/Settings');
const APIFeatures = require('../utils/apiFeatures');
const logActivity = require('../utils/activityLogger');
const generateInvoicePDF = require('../utils/pdfGenerator');
const { amountInWords } = require('../utils/numberToWords');
const sendEmail = require('../utils/sendEmail');
const fetchImageBuffer = require('../utils/fetchImageBuffer');
const resolveCustomer = require('../utils/resolveCustomer');

// Downloads the company logo and signature (if uploaded) into Buffers so
// PDFKit can embed them. Cached per-call — cheap enough not to bother with
// a shared cache, and always reflects the latest uploaded images.
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
const PDFDocument = require('pdfkit');

// Helper: builds line item calculations + totals
function computeTotals(items, tdsPercent = 0) {
  const computedItems = items.map((it) => {
    const rate = Number(it.rate) || 0;
    const qty = Number(it.qty) || 1;
    const taxableValue = rate * qty;
    const taxPercent = Number(it.taxPercent) || 0;
    const taxAmount = +(taxableValue * (taxPercent / 100)).toFixed(2);
    const amount = +(taxableValue + taxAmount).toFixed(2);
    return { item: it.item, rate, qty, taxableValue, taxPercent, taxAmount, amount };
  });

  const taxableAmount = +computedItems.reduce((s, i) => s + i.taxableValue, 0).toFixed(2);
  const totalTaxAmount = +computedItems.reduce((s, i) => s + i.taxAmount, 0).toFixed(2);
  const total = +(taxableAmount + totalTaxAmount).toFixed(2);
  const tdsAmount = +(taxableAmount * (Number(tdsPercent) / 100)).toFixed(2);
  const amountPayable = +(total - tdsAmount).toFixed(2);

  return { computedItems, taxableAmount, totalTaxAmount, total, tdsAmount, amountPayable };
}

async function getNextInvoiceNumber() {
  const settings = (await Settings.findOne()) || (await Settings.create({}));
  const count = await Invoice.countDocuments();
  const number = (settings.invoiceStartNumber || 1) + count;
  return { invoiceNumber: `${settings.invoicePrefix || 'INV-'}${number}`, settings };
}

// @desc Get all invoices
// @route GET /api/invoices
exports.getInvoices = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Invoice.find().populate('customer', 'name email phone'), req.query)
    .search(['invoiceNumber'])
    .filter()
    .sort()
    .paginate();

  const queryObj = { ...req.query };
  ['search', 'sort', 'page', 'limit', 'fields'].forEach((f) => delete queryObj[f]);

  const [invoices, total] = await Promise.all([features.query, Invoice.countDocuments(queryObj)]);

  res.json({
    success: true,
    count: invoices.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: invoices,
  });
});

// @desc Get single invoice
// @route GET /api/invoices/:id
exports.getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate('customer');
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  res.json({ success: true, data: invoice });
});

// @desc Create invoice
// @route POST /api/invoices
exports.createInvoice = asyncHandler(async (req, res) => {
  const { customer: customerInput, items, dueDate, invoiceDate, placeOfSupply, tdsPercent, notes } = req.body;

  const customer = await resolveCustomer(customerInput, req, res, 'an invoice');

  const { invoiceNumber, settings } = await getNextInvoiceNumber();
  const effectiveTds = tdsPercent !== undefined ? tdsPercent : settings.defaultTdsPercent;

  const { computedItems, taxableAmount, totalTaxAmount, total, tdsAmount, amountPayable } = computeTotals(
    items,
    effectiveTds
  );

  const invoice = await Invoice.create({
    invoiceNumber,
    invoiceDate: invoiceDate || Date.now(),
    dueDate,
    customer: customer._id,
    customerSnapshot: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      gstin: customer.gstin,
      billingAddress: customer.billingAddress,
    },
    placeOfSupply: placeOfSupply || customer.placeOfSupply || '',
    items: computedItems,
    taxableAmount,
    totalTaxAmount,
    total,
    tdsPercent: effectiveTds,
    tdsAmount,
    amountPaid: 0,
    amountPayable,
    amountInWords: amountInWords(total),
    notes,
    createdBy: req.user._id,
  });

  await logActivity({
    user: req.user,
    action: 'CREATE',
    module: 'Invoice',
    description: `Created invoice: ${invoice.invoiceNumber}`,
    entityId: invoice._id,
    req,
  });

  res.status(201).json({ success: true, data: invoice });
});

// @desc Update invoice
// @route PUT /api/invoices/:id
exports.updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  const { items, tdsPercent, dueDate, invoiceDate, placeOfSupply, notes, status } = req.body;

  if (items) {
    const effectiveTds = tdsPercent !== undefined ? tdsPercent : invoice.tdsPercent;
    const { computedItems, taxableAmount, totalTaxAmount, total, tdsAmount, amountPayable } = computeTotals(
      items,
      effectiveTds
    );
    invoice.items = computedItems;
    invoice.taxableAmount = taxableAmount;
    invoice.totalTaxAmount = totalTaxAmount;
    invoice.total = total;
    invoice.tdsPercent = effectiveTds;
    invoice.tdsAmount = tdsAmount;
    invoice.amountPayable = +(amountPayable - invoice.amountPaid).toFixed(2) + invoice.amountPaid; // keep paid unaffected
    invoice.amountPayable = +(total - tdsAmount - invoice.amountPaid).toFixed(2);
    invoice.amountInWords = amountInWords(total);
  }

  if (dueDate) invoice.dueDate = dueDate;
  if (invoiceDate) invoice.invoiceDate = invoiceDate;
  if (placeOfSupply !== undefined) invoice.placeOfSupply = placeOfSupply;
  if (notes !== undefined) invoice.notes = notes;
  if (status) invoice.status = status;

  await invoice.save();

  await logActivity({
    user: req.user,
    action: 'UPDATE',
    module: 'Invoice',
    description: `Updated invoice: ${invoice.invoiceNumber}`,
    entityId: invoice._id,
    req,
  });

  res.json({ success: true, data: invoice });
});

// @desc Delete invoice
// @route DELETE /api/invoices/:id
exports.deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByIdAndDelete(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  await logActivity({
    user: req.user,
    action: 'DELETE',
    module: 'Invoice',
    description: `Deleted invoice: ${invoice.invoiceNumber}`,
    entityId: invoice._id,
    req,
  });
  res.json({ success: true, message: 'Invoice deleted successfully' });
});

// @desc Stream/download invoice PDF (also used for Print - browser print dialog on the PDF)
// @route GET /api/invoices/:id/pdf
exports.getInvoicePDF = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate('customer');
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  const settingsDoc = (await Settings.findOne()) || {};
  const settings = await withImageBuffers(settingsDoc);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${invoice.invoiceNumber}.pdf`);

  generateInvoicePDF({ settings, invoice }, res);
});

// @desc Email invoice PDF to customer
// @route POST /api/invoices/:id/email
exports.emailInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate('customer');
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  const toEmail = req.body.email || invoice.customerSnapshot.email;
  if (!toEmail) {
    res.status(400);
    throw new Error('No recipient email available for this customer');
  }

  const settingsDoc = (await Settings.findOne()) || {};
  const settings = await withImageBuffers(settingsDoc);

  // Build PDF into a buffer
  const chunks = [];
  const pdfBufferPromise = new Promise((resolve, reject) => {
    const passthrough = {
      write: (chunk) => chunks.push(chunk),
      end: () => resolve(Buffer.concat(chunks)),
      setHeader: () => {},
    };
    generateInvoicePDF({ settings, invoice }, passthrough);
  });

  const pdfBuffer = await pdfBufferPromise;

  await sendEmail({
    to: toEmail,
    subject: `Invoice ${invoice.invoiceNumber} - ${settings.companyName || 'CrazyGrowMind Studio'}`,
    html: `
      <p>Dear ${invoice.customerSnapshot.name},</p>
      <p>Please find attached invoice <strong>${invoice.invoiceNumber}</strong> for an amount payable of ₹${invoice.amountPayable}.</p>
      <p>Thank you for your business.</p>
      <p>${settings.companyName || 'CrazyGrowMind Studio'}</p>
    `,
    attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, content: pdfBuffer }],
  });

  invoice.emailedAt = new Date();
  if (invoice.status === 'Draft') invoice.status = 'Sent';
  await invoice.save();

  await logActivity({
    user: req.user,
    action: 'EMAIL',
    module: 'Invoice',
    description: `Emailed invoice ${invoice.invoiceNumber} to ${toEmail}`,
    entityId: invoice._id,
    req,
  });

  res.json({ success: true, message: 'Invoice emailed successfully' });
});

// @desc Get (or create) a public share link for this invoice — anyone with
// the link can view/download the PDF, no login required.
// @route POST /api/invoices/:id/share
exports.getInvoiceShareLink = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  if (!invoice.shareToken) {
    invoice.shareToken = crypto.randomBytes(16).toString('hex');
    await invoice.save();
  }
  const base = `${req.protocol}://${req.get('host')}`;
  res.json({ success: true, url: `${base}/api/public/invoices/${invoice.shareToken}/pdf` });
});

// @desc Public (no-auth) invoice PDF, via share token
// @route GET /api/public/invoices/:token/pdf
exports.getPublicInvoicePDF = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ shareToken: req.params.token }).populate('customer');
  if (!invoice) {
    res.status(404);
    throw new Error('Link not found or expired');
  }
  const settingsDoc = (await Settings.findOne()) || {};
  const settings = await withImageBuffers(settingsDoc);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${invoice.invoiceNumber}.pdf`);

  generateInvoicePDF({ settings, invoice }, res);
});
