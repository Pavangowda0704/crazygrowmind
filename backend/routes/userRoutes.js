const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(protect, authorize('superadmin'));

router
  .route('/')
  .get(getUsers)
  .post(
    [
      body('name').notEmpty(),
      body('email').isEmail(),
      body('password').isLength({ min: 6 }),
    ],
    validate,
    createUser
  );

router.route('/:id').put(updateUser).delete(deleteUser);

module.exports = router;
