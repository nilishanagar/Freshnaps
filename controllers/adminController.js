const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');
const notificationService = require('../utils/notificationService');

/* ── helpers ─────────────────────────────────────────── */

const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const generateUniqueSlug = async (name, excludeId = null) => {
  let base = slugify(name);
  let slug = base;
  let i = 1;
  while (true) {
    const q = excludeId
      ? { slug, _id: { $ne: excludeId } }
      : { slug };
    const existing = await Product.findOne(q);
    if (!existing) break;
    slug = `${base}-${i++}`;
  }
  return slug;
};

/* ── Dashboard ───────────────────────────────────────── */

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

/* ── Products ────────────────────────────────────────── */

// GET /api/admin/products  — list with pagination
const adminGetProducts = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 20, search, status, category, sort = 'newest',
  } = req.query;

  const filter = { isActive: true };
  if (status) filter.status = status;
  if (search) {
    const re = new RegExp(search.trim(), 'i');
    filter.$or = [{ name: re }, { sku: re }, { brand: re }];
  }

  // category filter: support both ObjectId (new) and legacy string (old)
  if (category) {
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    } else {
      // Legacy: match against categoryLegacy string field
      filter.categoryLegacy = category;
    }
  }

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    name: { name: 1 },
    price: { price: 1 },
    stock: { stock: -1 },
  };
  const sortBy = sortMap[sort] || { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Product.countDocuments(filter),
  ]);

  // Safely populate category — only for products that have a valid ObjectId category
  const mongoose = require('mongoose');
  const Category = require('../models/Category');
  const categoryIds = products
    .map((p) => p.category)
    .filter((c) => c && mongoose.Types.ObjectId.isValid(c));

  let categoryMap = {};
  if (categoryIds.length > 0) {
    const cats = await Category.find({ _id: { $in: categoryIds } }).select('name slug').lean();
    cats.forEach((c) => { categoryMap[c._id.toString()] = c; });
  }

  // Attach populated category or fall back to legacy string
  const enriched = products.map((p) => {
    const catId = p.category?.toString?.();
    return {
      ...p,
      categoryData: catId && categoryMap[catId]
        ? categoryMap[catId]
        : { name: p.categoryLegacy || p.category || 'Uncategorized', slug: '' },
    };
  });

  res.json({
    success: true,
    products: enriched,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
});

// GET /api/admin/products/:id  — single product for edit
const adminGetProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) { res.status(404); throw new Error('Product not found'); }

  // Safely resolve category
  const mongoose = require('mongoose');
  const Category = require('../models/Category');
  let categoryData = null;
  const catVal = product.category;
  if (catVal && mongoose.Types.ObjectId.isValid(catVal)) {
    categoryData = await Category.findById(catVal).select('name slug _id').lean();
  }

  res.json({
    success: true,
    product: {
      ...product,
      categoryData: categoryData || { name: product.categoryLegacy || String(product.category || ''), slug: '' },
    },
  });
});

// GET /api/admin/products/check-sku?sku=xxx&excludeId=xxx
const checkSkuAvailability = asyncHandler(async (req, res) => {
  const { sku, excludeId } = req.query;
  if (!sku) return res.json({ available: true });
  const query = { sku: sku.trim() };
  if (excludeId) query._id = { $ne: excludeId };
  const existing = await Product.findOne(query);
  res.json({ success: true, available: !existing });
});

// POST /api/admin/products
const createProduct = asyncHandler(async (req, res) => {
  const mongoose = require('mongoose');
  const { name, sku, category, ...rest } = req.body;

  // Duplicate SKU check
  if (sku) {
    const skuExists = await Product.findOne({ sku: sku.trim() });
    if (skuExists) {
      res.status(409);
      throw new Error(`SKU "${sku}" is already in use`);
    }
  }

  // Only store category if it's a valid ObjectId; otherwise ignore (frontend sends ObjectId)
  const safeCategory = category && mongoose.Types.ObjectId.isValid(category) ? category : undefined;

  const slug = await generateUniqueSlug(name);
  const product = await Product.create({
    name,
    slug,
    sku: sku?.trim() || undefined,
    category: safeCategory,
    ...rest,
  });
  res.status(201).json({ success: true, product });
});

// PUT /api/admin/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const mongoose = require('mongoose');
  const { name, sku, category, ...rest } = req.body;
  const id = req.params.id;

  // Duplicate SKU check (excluding self)
  if (sku) {
    const skuExists = await Product.findOne({ sku: sku.trim(), _id: { $ne: id } });
    if (skuExists) {
      res.status(409);
      throw new Error(`SKU "${sku}" is already in use`);
    }
  }

  // Only store category if it's a valid ObjectId
  const safeCategory = category && mongoose.Types.ObjectId.isValid(category) ? category : undefined;

  const updateData = { ...rest, sku: sku?.trim() || undefined };
  if (safeCategory !== undefined) updateData.category = safeCategory;
  if (name) {
    updateData.name = name;
    updateData.slug = await generateUniqueSlug(name, id);
  }

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, product });
});

// DELETE /api/admin/products/:id  — soft delete
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false, status: 'archived' },
    { new: true }
  );
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, message: 'Product archived' });
});

/* ── Orders ──────────────────────────────────────────── */

const adminGetOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email phone');
  res.json({ success: true, orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, trackingId, deliveryPartner, trackingEvent, returnStatus, refundStatus, refundAmount } = req.body;

  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  if (trackingId) order.trackingId = trackingId;
  if (deliveryPartner) { order.deliveryPartner = deliveryPartner; order.shipmentProvider = deliveryPartner; }

  if (trackingEvent) {
    const { status, location, description } = trackingEvent;
    order.trackingHistory.push({
      status: status || order.orderStatus,
      location: location || 'Transit Hub',
      timestamp: new Date(),
      description: description || 'Package status updated.',
    });
  }

  if (orderStatus && orderStatus !== order.orderStatus) {
    const oldStatus = order.orderStatus;
    order.orderStatus = orderStatus;
    if (orderStatus === 'delivered') { order.deliveredAt = new Date(); order.paymentStatus = 'paid'; }

    const descMap = {
      confirmed: 'Order has been confirmed by our merchant.',
      packed: 'Order has been packed and is ready for courier handoff.',
      shipped: `Order handed over to ${order.deliveryPartner || 'courier'}. Tracking: ${order.trackingId || 'N/A'}`,
      out_for_delivery: 'Order is out for delivery with our executive.',
      delivered: 'Order successfully delivered to customer.',
      returned: 'Order has been returned back to our fulfillment center.',
      refunded: 'Refund processed and completed.',
    };

    order.trackingHistory.push({
      status: orderStatus,
      location: order.shippingAddress?.city || 'Fulfillment Center',
      timestamp: new Date(),
      description: descMap[orderStatus] || `Status changed from ${oldStatus} to ${orderStatus}.`,
    });

    order.statusHistory.push({ status: orderStatus, note: `Updated by Admin to ${orderStatus}.`, timestamp: new Date() });

    if (order.user) {
      try { await notificationService.sendOrderStatusUpdate(order, order.user); } catch (e) { console.error('Notification error:', e); }
    }
  }

  if (returnStatus && returnStatus !== order.returnStatus) {
    order.returnStatus = returnStatus;
    order.statusHistory.push({ status: order.orderStatus, note: `Return → ${returnStatus}`, timestamp: new Date() });
    try { await notificationService.sendReturnUpdate(order, order.user); } catch (e) { console.error('Notification error:', e); }
  }

  if (refundStatus && refundStatus !== order.refundStatus) {
    order.refundStatus = refundStatus;
    if (refundStatus === 'refunded') {
      order.refundDate = new Date(); order.orderStatus = 'refunded'; order.refundAmount = refundAmount || order.totalAmount;
    }
    order.statusHistory.push({ status: order.orderStatus, note: `Refund → ${refundStatus}. Amount: ₹${order.refundAmount}`, timestamp: new Date() });
  }

  await order.save();
  res.json({ success: true, order });
});

/* ── Users ───────────────────────────────────────────── */

const adminGetUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, users });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['customer', 'admin'].includes(role)) { res.status(400); throw new Error('Invalid role'); }
  if (req.user._id.toString() === req.params.id && role === 'customer') {
    res.status(400); throw new Error('You cannot demote yourself');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, user });
});

module.exports = {
  getDashboardStats,
  adminGetProducts,
  adminGetProduct,
  checkSkuAvailability,
  createProduct,
  updateProduct,
  deleteProduct,
  adminGetOrders,
  updateOrderStatus,
  adminGetUsers,
  updateUserRole,
};
