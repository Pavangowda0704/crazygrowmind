const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStatus,
} = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(protect);

router
  .route('/')
  .get(getLeads)
  .post(
    [body('name').notEmpty().withMessage('Name is required'), body('phone').notEmpty().withMessage('Phone is required')],
    validate,
    createLead
  );

router
  .route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(authorize('superadmin', 'admin'), deleteLead);

router.patch('/:id/status', updateLeadStatus);

module.exports = router;
