const mongoose = require('mongoose');

// A Payment record represents any money movement — a client paying an
// invoice or booking coupon ('in'), or the studio paying an employee
// ('out'). Exactly one of invoice / booking / employeePayment is set,
// matching `module`. This keeps a single unified ledger for the Payments
// page, reports, and dashboard while still tracing back to its source.
const paymentSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      enum: ['Invoice', 'Booking', 'EmployeePayment'],
      required: true,
      default: 'Invoice',
    },
    direction: { type: String, enum: ['in', 'out'], default: 'in' }, // in = received, out = paid out

    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    employeePayment: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeePayment' },

    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },

    partyName: { type: String, trim: true }, // display name regardless of module
    reference: { type: String, trim: true }, // invoiceNumber / couponId / payslipNumber

    amount: { type: Number, required: true },
    mode: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card', 'Other'],
      default: 'Bank Transfer',
    },
    referenceNo: { type: String, trim: true },
    paidOn: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

paymentSchema.index({ module: 1, invoice: 1, booking: 1, employeePayment: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
