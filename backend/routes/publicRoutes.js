const express = require('express');
const router = express.Router();
const { getPublicInvoicePDF } = require('../controllers/invoiceController');
const { getPublicBookingPDF } = require('../controllers/bookingController');

// No `protect` middleware on purpose — these are meant to be opened by a
// client who has no login, via an unguessable share token. Nothing here
// exposes a listing or lets a token be guessed/enumerated.
router.get('/invoices/:token/pdf', getPublicInvoicePDF);
router.get('/bookings/:token/pdf', getPublicBookingPDF);

module.exports = router;
