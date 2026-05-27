const router = require('express').Router();
const {
  getDashboardStats,
  adminGetProducts,
  adminGetProduct,
  checkSkuAvailability,
  createProduct,
  updateProduct,
  deleteProduct,
  adminGetOrders,
  updateOrderStatus,
  adminGetUsers,
  updateUserRole,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateProduct, validateSkuCheck } = require('../middleware/validateProduct');

router.use(protect, adminOnly);

// Dashboard
router.get('/stats', getDashboardStats);

// Products
router.get('/products/check-sku', validateSkuCheck, checkSkuAvailability);
router.get('/products', adminGetProducts);
router.get('/products/:id', adminGetProduct);
router.post('/products', validateProduct, createProduct);
router.put('/products/:id', validateProduct, updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders
router.get('/orders', adminGetOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Users
router.get('/users', adminGetUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
