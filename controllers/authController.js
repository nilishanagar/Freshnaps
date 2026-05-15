const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc  Register user
// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email, password, phone });
  const token = generateToken(user._id);

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

// @desc  Login user
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

  const token = generateToken(user._id);

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

  const token = generateToken(user._id);
  res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
});

module.exports = { register, login, getMe, adminLogin };
