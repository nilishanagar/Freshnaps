const router = require('express').Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  returnOrder,
  reorder,
  getInvoice,
  getTracking,
  addReview
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrder);
router.post('/:id/cancel', cancelOrder);
router.post('/:id/return', returnOrder);
router.post('/:id/reorder', reorder);
router.get('/:id/invoice', getInvoice);
router.get('/:id/tracking', getTracking);
router.post('/:id/review', addReview);

module.exports = router;
