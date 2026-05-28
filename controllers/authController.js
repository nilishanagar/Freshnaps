const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const User = require('../models/User');
const { generateOTP, hashOTP, verifyOTP } = require('../utils/otpService');
const generateToken = require('../utils/generateToken');


// Dynamic defensive imports for real communication services
const twilioService = require('../utils/twilioService');
const whatsappService = require('../utils/whatsappService');
const resendService = require('../utils/resendService');

// Helper to generate access and refresh tokens
const generateAuthTokens = async (user, res) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

  // Persist refresh token in db
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(refreshToken);
  await user.save();

  // Set HTTP-only Cookie for security
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  return accessToken;
};

// @desc  Register email user
// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill out all required fields');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  // Create verification token
  const verifyToken = crypto.randomBytes(32).toString('hex');
  const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({ 
    name, 
    email, 
    password, 
    phone,
    isEmailVerified: false,
    emailVerificationToken: verifyToken,
    emailVerificationExpires: verifyExpires
  });

  // Asynchronously dispatch transactional welcome / verification email
  try {
    await resendService.sendVerificationEmail(user.email, verifyToken);
  } catch (err) {
    console.error('Email Verification delivery warning:', err.message);
  }

  const token = await generateAuthTokens(user, res);

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      wishlist: user.wishlist,
    },
  });
});

// @desc  Login email user
// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Account has been deactivated');
  }

  const token = await generateAuthTokens(user, res);

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      wishlist: user.wishlist,
      addresses: user.addresses,
    },
  });
});

// @desc  Request Login/Signup Mobile OTP
// @route POST /api/auth/otp-request
const otpRequest = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone || !/^\+?[1-9]\d{6,14}$/.test(phone)) {
    res.status(400);
    throw new Error('Please provide a valid phone number');
  }

  // Generate 6-digit OTP
  const rawOtp = generateOTP();
  const hashedOtp = hashOTP(rawOtp);

  // Set expiry (5 minutes) and resend lock-out (60 seconds)
  const expiry = new Date(Date.now() + 5 * 60 * 1000);
  const resendTimer = new Date(Date.now() + 60 * 1000);

  let user = await User.findOne({ phone });
  if (!user) {
    // Auto-create customer profile on first sign-up
    user = await User.create({
      name: `User-${phone.slice(-4)}`,
      phone,
      role: 'customer',
      isActive: true,
    });
  }

  user.otp = hashedOtp;
  user.otpExpires = expiry;
  user.otpResendTimer = resendTimer;
  await user.save();

  // Async dispatch notifications
  try {
    await twilioService.sendSMSOTP(phone, rawOtp);
    await whatsappService.sendWhatsAppOTP(phone, rawOtp);
  } catch (err) {
    console.error('OTP delivery dispatch error:', err.message);
  }

  res.json({
    success: true,
    message: 'OTP verification code sent successfully!',
    resendAvailableAt: resendTimer
  });
});

// @desc  Verify Mobile OTP code
// @route POST /api/auth/otp-verify
const otpVerify = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    res.status(400);
    throw new Error('Please provide phone number and verification OTP');
  }

  const user = await User.findOne({ phone });
  if (!user) {
    res.status(404);
    throw new Error('User profile not found');
  }

  const isValid = verifyOTP(otp, user.otp, user.otpExpires);
  if (!isValid) {
    res.status(400);
    throw new Error('Invalid or expired verification OTP');
  }

  // Revoke OTP credentials upon success
  user.otp = undefined;
  user.otpExpires = undefined;
  user.otpResendTimer = undefined;

  const token = await generateAuthTokens(user, res);

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      wishlist: user.wishlist,
      addresses: user.addresses,
    }
  });
});

// @desc  Refresh user session token
// @route POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) {
    res.status(401);
    throw new Error('Access Denied. No session refresh token provided.');
  }

  const refreshToken = cookies.refreshToken;

  const user = await User.findOne({ refreshTokens: refreshToken });
  if (!user) {
    // Refresh token compromised, clean cookie
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    res.status(403);
    throw new Error('Invalid or compromised session token');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (decoded.id !== user._id.toString()) {
      throw new Error('Unauthorized');
    }

    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ success: true, token: newAccessToken });
  } catch (err) {
    // Clean expired or bad token from DB
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    await user.save();

    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    res.status(403);
    throw new Error('Session token expired or compromised');
  }
});

// @desc  Google OAuth Single Sign On
// @route POST /api/auth/google
const googleLogin = asyncHandler(async (req, res) => {
  const { credential, token, email: clientEmail, name: clientName, googleId: clientGoogleId } = req.body;

  let email, name, googleId;

  // 1. Secure Cryptographic Verification of ID Token (JWT)
  if (credential) {
    try {
      const googleClientId = process.env.GOOGLE_CLIENT_ID || '670908182695-ip45ijh7pebb2fetrn6c9fuj7nkafb1d.apps.googleusercontent.com';
      const client = new OAuth2Client(googleClientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
    } catch (err) {
      console.error('Google ID token verification failed:', err);
      res.status(401);
      throw new Error('Google identity token verification failed. Please try again.');
    }
  } 
  // 2. Secure Verification of Access Token
  else if (token) {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profile = response.data;
      email = profile.email;
      name = profile.name;
      googleId = profile.sub;
    } catch (err) {
      console.error('Google access token verification failed:', err);
      res.status(401);
      throw new Error('Google access token verification failed. Please try again.');
    }
  } 
  // 3. Fallback for non-production environments / compatibility
  else {
    if (process.env.NODE_ENV === 'production') {
      res.status(400);
      throw new Error('Google authentication token/credential is required in production.');
    }
    
    // In non-production, allow raw details as fallback if none supplied
    email = clientEmail;
    name = clientName;
    googleId = clientGoogleId;
  }

  if (!email || !googleId) {
    res.status(400);
    throw new Error('Google authorization arguments are incomplete.');
  }

  let user = await User.findOne({ $or: [{ googleId }, { email }] });
  if (!user) {
    // Automate registration
    user = await User.create({
      name: name || 'Google Bedding User',
      email,
      googleId,
      isEmailVerified: true,
      role: 'customer',
      isActive: true,
    });
  } else if (!user.googleId) {
    // Link google account to existing email user
    user.googleId = googleId;
    user.isEmailVerified = true;
    await user.save();
  }

  const authToken = await generateAuthTokens(user, res);

  res.json({
    success: true,
    token: authToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      wishlist: user.wishlist,
      addresses: user.addresses,
    }
  });
});

// @desc  Forgot Password
// @route POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('No account found with this email');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetExpires;
  await user.save();

  try {
    await resendService.sendResetPasswordEmail(user.email, resetToken);
  } catch (err) {
    console.error('Password reset email error:', err.message);
  }

  res.json({ success: true, message: 'Password reset link sent to your email.' });
});

// @desc  Reset Password
// @route POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshTokens = []; // Clear active sessions for absolute security
  await user.save();

  res.json({ success: true, message: 'Password has been updated. Please login.' });
});

// @desc  Verify email activation link
// @route GET /api/auth/verify-email/:token
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Email verification link is invalid or has expired.');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Your email has been verified successfully!' });
});

// @desc  Get current user
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images price discountPrice slug');
  res.json({ success: true, user });
});

// @desc  Admin login
// @route POST /api/auth/admin-login
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: 'admin' });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid admin credentials');
  }

  const token = await generateAuthTokens(user, res);
  res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
});

// @desc  Logout User & Clear Session Cookies
// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (cookies?.refreshToken) {
    const refreshToken = cookies.refreshToken;
    // Wipe refresh token from db
    await User.updateOne(
      { refreshTokens: refreshToken },
      { $pull: { refreshTokens: refreshToken } }
    );
  }
  
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  res.json({ success: true, message: 'User logged out successfully' });
});

module.exports = {
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
};
module.exports = {
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
};
