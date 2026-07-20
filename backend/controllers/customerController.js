const asyncHandler = require('express-async-handler');
const Customer = require('../models/Customer');
const APIFeatures = require('../utils/apiFeatures');
const logActivity = require('../utils/activityLogger');

exports.getCustomers = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Customer.find(), req.query)
    .search(['name', 'email', 'phone', 'company', 'gstin'])
    .filter()
    .sort()
    .paginate();

  const queryObj = { ...req.query };
  ['search', 'sort', 'page', 'limit', 'fields'].forEach((f) => delete queryObj[f]);

  const [customers, total] = await Promise.all([features.query, Customer.countDocuments(queryObj)]);

  res.json({
    success: true,
    count: customers.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: customers,
  });
});

exports.getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  res.json({ success: true, data: customer });
});

exports.createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create({ ...req.body, createdBy: req.user._id });
  await logActivity({
    user: req.user,
    action: 'CREATE',
    module: 'Customer',
    description: `Created customer: ${customer.name}`,
    entityId: customer._id,
    req,
  });
  res.status(201).json({ success: true, data: customer });
});

exports.updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  await logActivity({
    user: req.user,
    action: 'UPDATE',
    module: 'Customer',
    description: `Updated customer: ${customer.name}`,
    entityId: customer._id,
    req,
  });
  res.json({ success: true, data: customer });
});

exports.deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  await logActivity({
    user: req.user,
    action: 'DELETE',
    module: 'Customer',
    description: `Deleted customer: ${customer.name}`,
    entityId: customer._id,
    req,
  });
  res.json({ success: true, message: 'Customer deleted successfully' });
});
