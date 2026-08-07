const mongoose = require('mongoose');

// A line item on the payslip — earnings are positive amounts (e.g. "Basic
// Salary", "Bonus"), deductions are entered as negative amounts (e.g.
// "Advance Deduction: -2000") so netAmount is a simple sum.
const paymentItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const employeePaymentSchema = new mongoose.Schema(
  {
    payslipNumber: { type: String, required: true, unique: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    // Snapshot so historical payslips stay accurate even if the employee
    // record changes later (same pattern as Invoice.customerSnapshot).
    employeeSnapshot: {
      name: String,
      designation: String,
      phone: String,
      email: String,
      bankDetails: {
        accountHolder: String,
        accountNumber: String,
        ifscCode: String,
        bankName: String,
      },
    },
    period: { type: String, required: true }, // e.g. "August 2026"
    paymentDate: { type: Date, required: true, default: Date.now },
    items: [paymentItemSchema],
    netAmount: { type: Number, required: true, default: 0 },
    amountInWords: { type: String, default: '' },
    paymentMode: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other'],
      default: 'Bank Transfer',
    },
    referenceNo: { type: String, trim: true },
    status: { type: String, enum: ['Pending', 'Paid'], default: 'Paid' },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

employeePaymentSchema.index({ payslipNumber: 'text' });

module.exports = mongoose.model('EmployeePayment', employeePaymentSchema);
