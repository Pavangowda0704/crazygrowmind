const asyncHandler = require('express-async-handler');
const ActivityLog = require('../models/ActivityLog');
const APIFeatures = require('../utils/apiFeatures');

// @desc Get activity logs (paginated, filterable by module/action)
// @route GET /api/activity-logs
exports.getActivityLogs = asyncHandler(async (req, res) => {
  const features = new APIFeatures(ActivityLog.find().populate('user', 'name email'), req.query)
    .filter()
    .sort()
    .paginate();

  const queryObj = { ...req.query };
  ['search', 'sort', 'page', 'limit', 'fields'].forEach((f) => delete queryObj[f]);

  const [logs, total] = await Promise.all([features.query, ActivityLog.countDocuments(queryObj)]);

  res.json({
    success: true,
    count: logs.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: logs,
  });
});
