const asyncHandler = require('express-async-handler');
const Employee = require('../models/Employee');
const APIFeatures = require('../utils/apiFeatures');
const logActivity = require('../utils/activityLogger');

// @desc Get all employees
// @route GET /api/employees
exports.getEmployees = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Employee.find(), req.query)
    .search(['name', 'phone', 'email', 'designation'])
    .filter()
    .sort()
    .paginate();

  const queryObj = { ...req.query };
  ['search', 'sort', 'page', 'limit', 'fields'].forEach((f) => delete queryObj[f]);

  const [employees, total] = await Promise.all([features.query, Employee.countDocuments(queryObj)]);

  res.json({
    success: true,
    count: employees.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: employees,
  });
});

// @desc Get single employee
// @route GET /api/employees/:id
exports.getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  res.json({ success: true, data: employee });
});

// @desc Create employee
// @route POST /api/employees
exports.createEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.create({ ...req.body, createdBy: req.user._id });
  await logActivity({
    user: req.user,
    action: 'CREATE',
    module: 'Employee',
    description: `Added employee: ${employee.name}`,
    entityId: employee._id,
    req,
  });
  res.status(201).json({ success: true, data: employee });
});

// @desc Update employee
// @route PUT /api/employees/:id
exports.updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  await logActivity({
    user: req.user,
    action: 'UPDATE',
    module: 'Employee',
    description: `Updated employee: ${employee.name}`,
    entityId: employee._id,
    req,
  });
  res.json({ success: true, data: employee });
});

// @desc Delete employee
// @route DELETE /api/employees/:id
exports.deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  await logActivity({
    user: req.user,
    action: 'DELETE',
    module: 'Employee',
    description: `Deleted employee: ${employee.name}`,
    entityId: employee._id,
    req,
  });
  res.json({ success: true, message: 'Employee deleted successfully' });
});
