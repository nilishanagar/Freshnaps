const { body, query, validationResult } = require('express-validator');

/**
 * Middleware: run validation chain and return 422 on errors
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().reduce((acc, e) => {
        acc[e.path] = e.msg;
        return acc;
      }, {}),
    });
  }
  next();
};

/**
 * Validation chain for creating/updating a product
 */
const validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Name must be under 200 characters'),

  body('sku')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('SKU must be under 100 characters'),

  body('price')
    .notEmpty().withMessage('Price (MRP) is required')
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),

  body('discountPrice')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Discount price must be a non-negative number')
    .custom((val, { req }) => {
      if (val && Number(val) >= Number(req.body.price)) {
        throw new Error('Discount price must be less than MRP');
      }
      return true;
    }),

  body('stock')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0 }).withMessage('Stock cannot be negative'),

  body('costPrice')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Cost price must be non-negative'),

  body('taxPercent')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0, max: 100 }).withMessage('Tax must be between 0 and 100'),

  body('weight')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Weight must be non-negative'),

  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),

  body('seo.metaTitle')
    .optional()
    .isLength({ max: 70 }).withMessage('Meta title should be under 70 characters'),

  body('seo.metaDescription')
    .optional()
    .isLength({ max: 160 }).withMessage('Meta description should be under 160 characters'),

  handleValidation,
];

/**
 * SKU check query validator
 */
const validateSkuCheck = [
  query('sku').trim().notEmpty().withMessage('SKU is required'),
  handleValidation,
];

module.exports = { validateProduct, validateSkuCheck };
