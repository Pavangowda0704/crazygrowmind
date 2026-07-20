const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema(
  {
    item: { type: String, required: true },
    rate: { type: Number, required: true, default: 0 },
    qty: { type: Number, required: true, default: 1 },
    taxableValue: { type: Number, required: true, default: 0 },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    amount: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerSnapshot: {
      name: String,
      email: String,
      phone: String,
      gstin: String,
      billingAddress: Object,
    },
    placeOfSupply: { type: String, default: '' },
    items: [invoiceItemSchema],
    taxableAmount: { type: Number, default: 0 },
    totalTaxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    tdsPercent: { type: Number, default: 0 },
    tdsAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    amountPayable: { type: Number, default: 0 },
    amountInWords: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'],
      default: 'Draft',
    },
    notes: { type: String, trim: true },
    pdf: { url: String, public_id: String },
    emailedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

invoiceSchema.index({ invoiceNumber: 'text' });

module.exports = mongoose.model('Invoice', invoiceSchema);
