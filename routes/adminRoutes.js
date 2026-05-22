const router = require('express').Router();
const { getDashboardStats, adminGetProducts, createProduct, updateProduct, deleteProduct, adminGetOrders, updateOrderStatus, adminGetUsers, updateUserRole } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/products', adminGetProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/orders', adminGetOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', adminGetUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
