const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');
const logActivity = require('../utils/activityLogger');
const { resolveUploadedFile, deleteUploadedFile } = require('../middleware/upload');

// @desc Get company settings (singleton doc)
// @route GET /api/settings
exports.getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json({ success: true, data: settings });
});

// @desc Update company/GST/invoice/email settings
// @route PUT /api/settings
exports.updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();

  Object.assign(settings, req.body);
  await settings.save();

  await logActivity({
    user: req.user,
    action: 'UPDATE',
    module: 'Settings',
    description: 'Updated company settings',
    entityId: settings._id,
    req,
  });

  res.json({ success: true, data: settings });
});

// @desc Upload/replace company logo
// @route PUT /api/settings/logo
exports.updateLogo = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a logo image');
  }

  await deleteUploadedFile(settings.logo);
  settings.logo = resolveUploadedFile(req, 'branding');
  await settings.save();

  res.json({ success: true, data: settings });
});

// @desc Upload/replace authorized signatory signature image
// @route PUT /api/settings/signature
exports.updateSignature = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a signature image');
  }

  await deleteUploadedFile(settings.signature);
  settings.signature = resolveUploadedFile(req, 'branding');
  await settings.save();

  res.json({ success: true, data: settings });
});
