const router = require('express').Router();
const { updateProfile, addAddress, deleteAddress, toggleWishlist } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.put('/profile', updateProfile);
router.post('/addresses', addAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.post('/wishlist/:productId', toggleWishlist);

module.exports = router;
