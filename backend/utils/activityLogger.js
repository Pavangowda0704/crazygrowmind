const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ user, action, module, description, entityId, req }) => {
  try {
    await ActivityLog.create({
      user: user?._id || user,
      action,
      module,
      description,
      entityId,
      ipAddress: req ? req.ip : undefined,
    });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
};

module.exports = logActivity;
