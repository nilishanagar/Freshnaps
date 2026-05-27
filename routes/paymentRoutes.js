const router = require('express').Router();
const { handleRazorpayWebhook, handleStripeWebhook } = require('../controllers/paymentController');

// Public endpoints hit by external gateway servers
router.post('/razorpay/webhook', handleRazorpayWebhook);
router.post('/stripe/webhook', handleStripeWebhook);

module.exports = router;
