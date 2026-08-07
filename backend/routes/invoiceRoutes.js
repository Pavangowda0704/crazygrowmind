const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicePDF,
  emailInvoice,
  getInvoiceShareLink,
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(protect);

router
  .route('/')
  .get(getInvoices)
  .post(
    [
      body('customer').notEmpty().withMessage('Customer is required'),
      body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
      body('dueDate').notEmpty().withMessage('Due date is required'),
    ],
    validate,
    createInvoice
  );

router
  .route('/:id')
  .get(getInvoice)
  .put(updateInvoice)
  .delete(authorize('superadmin', 'admin'), deleteInvoice);

router.get('/:id/pdf', getInvoicePDF); // also used for Print (opens PDF, browser print dialog)
router.post('/:id/email', emailInvoice);
router.post('/:id/share', getInvoiceShareLink); // returns a public, no-login share link

module.exports = router;
