const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email required'), body('password').notEmpty().withMessage('Password required')],
  validate,
  login
);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', [body('email').isEmail()], validate, forgotPassword);
router.put(
  '/reset-password/:token',
  [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  validate,
  resetPassword
);
router.put(
  '/update-password',
  protect,
  [body('newPassword').isLength({ min: 6 })],
  validate,
  updatePassword
);

module.exports = router;
