const asyncHandler = require('express-async-handler');
const Lead = require('../models/Lead');
const APIFeatures = require('../utils/apiFeatures');
const logActivity = require('../utils/activityLogger');

// @desc Get all leads (search, filter, sort, paginate)
// @route GET /api/leads
exports.getLeads = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Lead.find().populate('assignedTo', 'name email'), req.query)
    .search(['name', 'email', 'phone', 'company'])
    .filter()
    .sort()
    .paginate();

  const [leads, total] = await Promise.all([
    features.query,
    Lead.countDocuments(buildFilterOnly(req.query)),
  ]);

  res.json({
    success: true,
    count: leads.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: leads,
  });
});

function buildFilterOnly(queryString) {
  const queryObj = { ...queryString };
  ['search', 'sort', 'page', 'limit', 'fields'].forEach((f) => delete queryObj[f]);
  return queryObj;
}

// @desc Get single lead
// @route GET /api/leads/:id
exports.getLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email');
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }
  res.json({ success: true, data: lead });
});

// @desc Create lead
// @route POST /api/leads
exports.createLead = asyncHandler(async (req, res) => {
  const lead = await Lead.create({ ...req.body, createdBy: req.user._id });
  await logActivity({
    user: req.user,
    action: 'CREATE',
    module: 'Lead',
    description: `Created lead: ${lead.name}`,
    entityId: lead._id,
    req,
  });
  res.status(201).json({ success: true, data: lead });
});

// @desc Update lead
// @route PUT /api/leads/:id
exports.updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }
  await logActivity({
    user: req.user,
    action: 'UPDATE',
    module: 'Lead',
    description: `Updated lead: ${lead.name}`,
    entityId: lead._id,
    req,
  });
  res.json({ success: true, data: lead });
});

// @desc Delete lead
// @route DELETE /api/leads/:id
exports.deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }
  await logActivity({
    user: req.user,
    action: 'DELETE',
    module: 'Lead',
    description: `Deleted lead: ${lead.name}`,
    entityId: lead._id,
    req,
  });
  res.json({ success: true, message: 'Lead deleted successfully' });
});

// @desc Update lead status only
// @route PATCH /api/leads/:id/status
exports.updateLeadStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const lead = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }
  await logActivity({
    user: req.user,
    action: 'UPDATE',
    module: 'Lead',
    description: `Changed status of lead ${lead.name} to ${status}`,
    entityId: lead._id,
    req,
  });
  res.json({ success: true, data: lead });
});
