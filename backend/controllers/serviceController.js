const asyncHandler = require('express-async-handler');
const Service = require('../models/Service');
const APIFeatures = require('../utils/apiFeatures');
const logActivity = require('../utils/activityLogger');
const { resolveUploadedFile, deleteUploadedFile } = require('../middleware/upload');

exports.getServices = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Service.find(), req.query)
    .search(['name', 'category', 'description'])
    .filter()
    .sort()
    .paginate();

  const queryObj = { ...req.query };
  ['search', 'sort', 'page', 'limit', 'fields'].forEach((f) => delete queryObj[f]);

  const [services, total] = await Promise.all([features.query, Service.countDocuments(queryObj)]);

  res.json({
    success: true,
    count: services.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: services,
  });
});

exports.getServiceCategories = asyncHandler(async (req, res) => {
  const categories = await Service.distinct('category');
  res.json({ success: true, data: categories });
});

exports.getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  res.json({ success: true, data: service });
});

exports.createService = asyncHandler(async (req, res) => {
  const payload = { ...req.body, createdBy: req.user._id };
  if (req.file) {
    payload.image = resolveUploadedFile(req, 'services');
  }
  const service = await Service.create(payload);
  await logActivity({
    user: req.user,
    action: 'CREATE',
    module: 'Service',
    description: `Created service: ${service.name}`,
    entityId: service._id,
    req,
  });
  res.status(201).json({ success: true, data: service });
});

exports.updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  const payload = { ...req.body };
  if (req.file) {
    await deleteUploadedFile(service.image);
    payload.image = resolveUploadedFile(req, 'services');
  }

  Object.assign(service, payload);
  await service.save();

  await logActivity({
    user: req.user,
    action: 'UPDATE',
    module: 'Service',
    description: `Updated service: ${service.name}`,
    entityId: service._id,
    req,
  });
  res.json({ success: true, data: service });
});

exports.deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  if (service.image) {
    await deleteUploadedFile(service.image);
  }
  await logActivity({
    user: req.user,
    action: 'DELETE',
    module: 'Service',
    description: `Deleted service: ${service.name}`,
    entityId: service._id,
    req,
  });
  res.json({ success: true, message: 'Service deleted successfully' });
});
