const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc  Create order
// @route POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, couponCode, notes } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Calculate totals
  let subtotal = 0;
  const enrichedItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    subtotal += price * item.quantity;
    enrichedItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0] || '',
      price,
      quantity: item.quantity,
      variant: item.variant || {},
    });

    // Reduce stock
    product.stock -= item.quantity;
    await product.save();
  }

  const shippingCharge = subtotal >= 999 ? 0 : 99;
  const discount = 0; // coupon logic can be added later
  const totalAmount = subtotal - discount + shippingCharge;

  const order = await Order.create({
    user: req.user._id,
    orderItems: enrichedItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'COD',
    subtotal,
    discount,
    shippingCharge,
    totalAmount,
    couponCode,
    notes,
  });

  res.status(201).json({ success: true, order });
});

// @desc  Get my orders
// @route GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc  Get single order
// @route GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Only owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  res.json({ success: true, order });
});

module.exports = { createOrder, getMyOrders, getOrder };
