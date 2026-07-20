const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, updateLogo, updateSignature } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');
const { createUploader } = require('../middleware/upload');
const upload = createUploader('branding');

router.use(protect);

router.route('/').get(getSettings).put(authorize('superadmin', 'admin'), updateSettings);
router.put('/logo', authorize('superadmin', 'admin'), upload.single('logo'), updateLogo);
router.put('/signature', authorize('superadmin', 'admin'), upload.single('signature'), updateSignature);

module.exports = router;
