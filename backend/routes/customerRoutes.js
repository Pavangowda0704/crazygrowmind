const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(protect);

router
  .route('/')
  .get(getCustomers)
  .post(
    [body('name').notEmpty().withMessage('Name is required'), body('phone').notEmpty().withMessage('Phone is required')],
    validate,
    createCustomer
  );

router
  .route('/:id')
  .get(getCustomer)
  .put(updateCustomer)
  .delete(authorize('superadmin', 'admin'), deleteCustomer);

module.exports = router;
