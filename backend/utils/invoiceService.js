const Invoice = require('../models/Invoice');
const Settings = require('../models/Settings');
const { amountInWords } = require('./numberToWords');

// Line-item math shared by createInvoice and updateInvoice (and now
// booking-to-invoice conversion) so tax/TDS is calculated identically
// everywhere an invoice total is computed.
function computeInvoiceTotals(items, tdsPercent = 0) {
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

// Creates an Invoice document for a resolved Customer doc. Does NOT touch
// Payments or logActivity — callers (createInvoice, booking conversion)
// handle that themselves since the activity description/context differs.
async function createInvoiceRecord({ customer, items, invoiceDate, dueDate, placeOfSupply, tdsPercent, notes, sourceBooking, createdBy }) {
  const { invoiceNumber, settings } = await getNextInvoiceNumber();
  const effectiveTds = tdsPercent !== undefined ? tdsPercent : settings.defaultTdsPercent;

  const { computedItems, taxableAmount, totalTaxAmount, total, tdsAmount, amountPayable } = computeInvoiceTotals(
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
    sourceBooking: sourceBooking || undefined,
    createdBy,
  });

  return invoice;
}

module.exports = { computeInvoiceTotals, getNextInvoiceNumber, createInvoiceRecord };
