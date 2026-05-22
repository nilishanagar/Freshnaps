const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Helper: generate slug
const generateSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();

// @desc  Dashboard stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalProducts, totalOrders, totalUsers, revenueData] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
  ]);
  const totalRevenue = revenueData[0]?.total || 0;
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');
  res.json({ success: true, stats: { totalProducts, totalOrders, totalUsers, totalRevenue }, recentOrders });
});

// @desc  Admin: get all products
const adminGetProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json({ success: true, products });
});

// @desc  Admin: create product
const createProduct = asyncHandler(async (req, res) => {
  const slug = generateSlug(req.body.name);
  const product = await Product.create({ ...req.body, slug });
  res.status(201).json({ success: true, product });
});

// @desc  Admin: update product
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, product });
});

// @desc  Admin: delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, message: 'Product removed' });
});

// @desc  Admin: get all orders
const adminGetOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email phone');
  res.json({ success: true, orders });
});

// @desc  Admin: update order status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      orderStatus: req.body.orderStatus,
      ...(req.body.trackingNumber && { trackingNumber: req.body.trackingNumber }),
      ...(req.body.orderStatus === 'delivered' && { deliveredAt: new Date() }),
    },
    { new: true }
  );
  if (!order) { res.status(404); throw new Error('Order not found'); }
  res.json({ success: true, order });
});

// @desc  Admin: get all users
const adminGetUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// @desc  Admin: update user role
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['customer', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  // Prevent self-demotion
  if (req.user._id.toString() === req.params.id && role === 'customer') {
    res.status(400);
    throw new Error('You cannot demote yourself');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ success: true, user });
});

module.exports = { getDashboardStats, adminGetProducts, createProduct, updateProduct, deleteProduct, adminGetOrders, updateOrderStatus, adminGetUsers, updateUserRole };
