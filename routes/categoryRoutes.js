const router = require('express').Router();
const {
  getCategories,
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public — storefront can read categories
router.get('/', getCategories);
router.get('/tree', getCategoryTree);

// Admin only
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
