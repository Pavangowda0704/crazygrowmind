const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityLogController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getActivityLogs);

module.exports = router;
