const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const notificationService = require('../utils/notificationService');

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

// @desc  Admin: update order status, tracking, and refund/return statuses
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, trackingId, deliveryPartner, trackingEvent, returnStatus, refundStatus, refundAmount } = req.body;

  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // 1. Update Tracking Details
  if (trackingId) order.trackingId = trackingId;
  if (deliveryPartner) {
    order.deliveryPartner = deliveryPartner;
    order.shipmentProvider = deliveryPartner;
  }

  // 2. Add custom Tracking Event (if provided)
  if (trackingEvent) {
    const { status, location, description } = trackingEvent;
    order.trackingHistory.push({
      status: status || order.orderStatus,
      location: location || 'Transit Hub',
      timestamp: new Date(),
      description: description || 'Package status updated.'
    });
  }

  // 3. Update Order Status
  if (orderStatus && orderStatus !== order.orderStatus) {
    const oldStatus = order.orderStatus;
    order.orderStatus = orderStatus;

    if (orderStatus === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid';
    }

    // Auto-generate tracking history for standard updates
    let desc = '';
    let loc = order.shippingAddress?.city || 'Fulfillment Center';
    
    if (orderStatus === 'confirmed') desc = 'Order has been confirmed by our merchant.';
    else if (orderStatus === 'packed') desc = 'Order has been packed and is ready for courier handoff.';
    else if (orderStatus === 'shipped') desc = `Order has been handed over to ${order.deliveryPartner || 'courier'}. Tracking ID: ${order.trackingId || 'N/A'}`;
    else if (orderStatus === 'out_for_delivery') desc = 'Order is out for delivery with our executive.';
    else if (orderStatus === 'delivered') desc = 'Order successfully delivered to customer.';
    else if (orderStatus === 'returned') desc = 'Order has been returned back to our fulfillment center.';
    else if (orderStatus === 'refunded') desc = 'Refund processed and completed.';

    order.trackingHistory.push({
      status: orderStatus,
      location: loc,
      timestamp: new Date(),
      description: desc || `Status changed from ${oldStatus} to ${orderStatus}.`
    });

    order.statusHistory.push({
      status: orderStatus,
      note: `Status updated by Admin to ${orderStatus}.`,
      timestamp: new Date()
    });

    // Send order status notification
    try {
      await notificationService.sendOrderStatusUpdate(order, order.user);
    } catch (notifErr) {
      console.error('Notification error:', notifErr);
    }
  }

  // 4. Update Return/Refund Statuses
  if (returnStatus && returnStatus !== order.returnStatus) {
    order.returnStatus = returnStatus;
    order.statusHistory.push({
      status: order.orderStatus,
      note: `Return status updated to ${returnStatus} by Admin.`,
      timestamp: new Date()
    });

    // Send return update notification
    try {
      await notificationService.sendReturnUpdate(order, order.user);
    } catch (notifErr) {
      console.error('Notification error:', notifErr);
    }
  }

  if (refundStatus && refundStatus !== order.refundStatus) {
    order.refundStatus = refundStatus;
    if (refundStatus === 'refunded') {
      order.refundDate = new Date();
      order.orderStatus = 'refunded';
      order.refundAmount = refundAmount || order.totalAmount;
    }
    
    order.statusHistory.push({
      status: order.orderStatus,
      note: `Refund status updated to ${refundStatus} by Admin. Refund amount: INR ${order.refundAmount}`,
      timestamp: new Date()
    });
  }

  await order.save();
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
