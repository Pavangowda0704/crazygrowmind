const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(protect);

router
  .route('/')
  .get(getEmployees)
  .post(
    [
      body('name').notEmpty().withMessage('Name is required'),
      body('phone').notEmpty().withMessage('Phone is required'),
    ],
    validate,
    createEmployee
  );

router
  .route('/:id')
  .get(getEmployee)
  .put(updateEmployee)
  .delete(authorize('superadmin', 'admin'), deleteEmployee);

module.exports = router;
