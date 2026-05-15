const router = require('express').Router();
const { createOrder, getMyOrders, getOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrder);

module.exports = router;
