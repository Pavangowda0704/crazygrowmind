const express = require('express');
const router = express.Router();
const {
  revenueReport,
  leadsReport,
  customersReport,
  servicesReport,
  invoicesReport,
  paymentsReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/revenue', revenueReport);
router.get('/leads', leadsReport);
router.get('/customers', customersReport);
router.get('/services', servicesReport);
router.get('/invoices', invoicesReport);
router.get('/payments', paymentsReport);

module.exports = router;
