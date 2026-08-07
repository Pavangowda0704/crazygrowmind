const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getEmployeePayments,
  getEmployeePayment,
  createEmployeePayment,
  updateEmployeePayment,
  deleteEmployeePayment,
  getEmployeePaymentPDF,
} = require('../controllers/employeePaymentController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(protect);

router
  .route('/')
  .get(getEmployeePayments)
  .post(
    [
      body('employee').notEmpty().withMessage('Employee is required'),
      body('period').notEmpty().withMessage('Pay period is required'),
    ],
    validate,
    createEmployeePayment
  );

router
  .route('/:id')
  .get(getEmployeePayment)
  .put(updateEmployeePayment)
  .delete(authorize('superadmin', 'admin'), deleteEmployeePayment);

router.get('/:id/pdf', getEmployeePaymentPDF); // preview (iframe) + download + print

module.exports = router;
