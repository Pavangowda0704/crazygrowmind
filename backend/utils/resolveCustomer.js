const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const logActivity = require('./activityLogger');

// Accepts either an existing customer's ObjectId, or an inline object with
// a new client's details (typed directly on an invoice or booking form
// instead of pre-adding them under Customers). In the latter case it
// reuses an existing customer with the same phone number if one exists,
// otherwise creates one automatically — shared by invoices and bookings so
// a client's invoice and booking history always live under one Customer
// record instead of two disconnected copies.
async function resolveCustomer(customerInput, req, res, sourceLabel = 'a record') {
  if (customerInput && typeof customerInput === 'string' && mongoose.isValidObjectId(customerInput)) {
    const customer = await Customer.findById(customerInput);
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }
    return customer;
  }

  if (customerInput && typeof customerInput === 'object' && customerInput.name && customerInput.phone) {
    const existing = await Customer.findOne({ phone: customerInput.phone });
    if (existing) return existing;

    const created = await Customer.create({
      name: customerInput.name,
      email: customerInput.email,
      phone: customerInput.phone,
      company: customerInput.company,
      gstin: customerInput.gstin,
      billingAddress: customerInput.billingAddress,
      placeOfSupply: customerInput.placeOfSupply,
      createdBy: req.user._id,
    });

    await logActivity({
      user: req.user,
      action: 'CREATE',
      module: 'Customer',
      description: `Auto-added customer "${created.name}" while creating ${sourceLabel}`,
      entityId: created._id,
      req,
    });

    return created;
  }

  res.status(400);
  throw new Error('Customer is required');
}

module.exports = resolveCustomer;
