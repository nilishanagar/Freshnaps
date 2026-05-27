const router = require('express').Router();
const { 
  register, 
  login, 
  otpRequest, 
  otpVerify, 
  refresh, 
  googleLogin, 
  forgotPassword, 
  resetPassword, 
  verifyEmail, 
  getMe, 
  adminLogin, 
  logout 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/otp-request', otpRequest);
router.post('/otp-verify', otpVerify);
router.post('/refresh', refresh);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/admin-login', adminLogin);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
