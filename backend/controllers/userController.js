const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const logActivity = require('../utils/activityLogger');

// @desc Get all admin/staff users (superadmin only)
// @route GET /api/users
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json({ success: true, count: users.length, data: users });
});

// @desc Create a new admin/staff user (superadmin only)
// @route POST /api/users
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }
  const user = await User.create({ name, email, password, role });
  await logActivity({
    user: req.user,
    action: 'CREATE',
    module: 'User',
    description: `Created user account: ${user.email}`,
    entityId: user._id,
    req,
  });
  res.status(201).json({ success: true, data: user });
});

// @desc Update user (role/active status)
// @route PUT /api/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
  const { name, role, isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  await user.save();

  await logActivity({
    user: req.user,
    action: 'UPDATE',
    module: 'User',
    description: `Updated user account: ${user.email}`,
    entityId: user._id,
    req,
  });
  res.json({ success: true, data: user });
});

// @desc Delete user
// @route DELETE /api/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await logActivity({
    user: req.user,
    action: 'DELETE',
    module: 'User',
    description: `Deleted user account: ${user.email}`,
    entityId: user._id,
    req,
  });
  res.json({ success: true, message: 'User deleted successfully' });
});
