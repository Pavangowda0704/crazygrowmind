const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingPDF,
  getBookingShareLink,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(protect);

router
  .route('/')
  .get(getBookings)
  .post(
    [
      body('customer').notEmpty().withMessage('Customer is required'),
      body('serviceType').notEmpty().withMessage('Service / shoot type is required'),
      body('shootDate').notEmpty().withMessage('Shoot date is required'),
      body('bookingAmount').isNumeric().withMessage('Booking amount must be a number'),
    ],
    validate,
    createBooking
  );

router
  .route('/:id')
  .get(getBooking)
  .put(updateBooking)
  .delete(authorize('superadmin', 'admin'), deleteBooking);

router.get('/:id/pdf', getBookingPDF); // preview (iframe) + download + print
router.post('/:id/share', getBookingShareLink); // returns a public, no-login share link

module.exports = router;
