const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getServices,
  getService,
  getServiceCategories,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createUploader } = require('../middleware/upload');
const upload = createUploader('services');

router.use(protect);

router.get('/categories', getServiceCategories);

router
  .route('/')
  .get(getServices)
  .post(
    upload.single('image'),
    [
      body('name').notEmpty().withMessage('Name is required'),
      body('category').notEmpty().withMessage('Category is required'),
      body('price').isNumeric().withMessage('Price must be a number'),
    ],
    validate,
    createService
  );

router
  .route('/:id')
  .get(getService)
  .put(upload.single('image'), updateService)
  .delete(authorize('superadmin', 'admin'), deleteService);

module.exports = router;
