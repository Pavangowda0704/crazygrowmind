const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // e.g. CREATE, UPDATE, DELETE, LOGIN
    module: { type: String, required: true }, // e.g. Lead, Customer, Invoice
    description: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    ipAddress: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
