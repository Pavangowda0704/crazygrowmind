const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: 'CRAZYGROWMIND STUDIO' },
    gstin: { type: String, default: '' },
    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    mobile: { type: String, default: '' },
    email: { type: String, default: '' },
    logo: { url: String, public_id: String },
    signature: { url: String, public_id: String },
    invoicePrefix: { type: String, default: 'INV-' },
    invoiceStartNumber: { type: Number, default: 1 },
    defaultTdsPercent: { type: Number, default: 2 },
    websiteUrl: { type: String, default: 'https://crazygrowmindstudio.com' },
    bookingPrefix: { type: String, default: 'CGM-BKG-' },
    payslipPrefix: { type: String, default: 'CGM-EMP-' },
    payslipStartNumber: { type: Number, default: 1 },
    bankDetails: {
      bankName: { type: String, default: '' },
      accountHolder: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      branch: { type: String, default: '' },
    },
    emailSettings: {
      smtpHost: String,
      smtpPort: Number,
      smtpUser: String,
      fromName: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
