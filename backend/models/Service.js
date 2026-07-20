const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, default: 0 },
    taxPercent: { type: Number, default: 0 },
    unit: { type: String, default: 'Service' },
    image: { url: String, public_id: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

serviceSchema.index({ name: 'text', category: 'text', description: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
