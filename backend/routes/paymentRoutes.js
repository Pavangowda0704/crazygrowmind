const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getPayments,
  getPendingPayments,
  getPaymentAnalytics,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(protect);

router.get('/pending', getPendingPayments);
router.get('/analytics', getPaymentAnalytics);

router
  .route('/')
  .get(getPayments)
  .post(
    [
      body('invoice').notEmpty().withMessage('Invoice is required'),
      body('amount').isNumeric().withMessage('Amount must be a number'),
    ],
    validate,
    createPayment
  );

router
  .route('/:id')
  .get(getPayment)
  .put(updatePayment)
  .delete(authorize('superadmin', 'admin'), deletePayment);

module.exports = router;