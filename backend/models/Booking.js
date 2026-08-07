const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    couponId: { type: String, required: true, unique: true },
    bookingDate: { type: Date, required: true, default: Date.now },

    clientName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },

    serviceType: { type: String, required: true, trim: true }, // e.g. "Brand Shoot"
    shootDate: { type: Date, required: true },
    shootLocation: { type: String, trim: true },

    bookingAmount: { type: Number, required: true, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },

    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Partially Paid', 'Fully Paid'],
      default: 'Unpaid',
    },
    paymentMode: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card', 'Other'],
      default: 'UPI',
    },
    transactionRef: { type: String, trim: true },
    authorizedBy: { type: String, trim: true },
    notes: { type: String, trim: true },

    // Same Customer record an invoice would use — bookings and invoices
    // for one client now share one Customer, instead of the booking
    // keeping its own disconnected copy of the client's details.
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    shareToken: { type: String, unique: true, sparse: true },
    sourceInvoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }, // set if created via reverse-converting a Draft invoice
    convertedToInvoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }, // set if converted to a GST invoice
    convertedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

bookingSchema.index({ couponId: 'text', clientName: 'text', mobile: 'text' });

module.exports = mongoose.model('Booking', bookingSchema);
