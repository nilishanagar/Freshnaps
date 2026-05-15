const router = require('express').Router();
const { getProducts, getProductBySlug, getRelatedProducts, addReview } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.get('/:slug/related', getRelatedProducts);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
