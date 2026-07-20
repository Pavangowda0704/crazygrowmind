const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    source: {
      type: String,
      enum: ['Website', 'Referral', 'Social Media', 'Cold Call', 'Advertisement', 'Other'],
      default: 'Other',
    },
    serviceInterested: { type: String, trim: true },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'],
      default: 'New',
    },
    value: { type: Number, default: 0 },
    notes: { type: String, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    convertedToCustomer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

leadSchema.index({ name: 'text', email: 'text', phone: 'text', company: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
