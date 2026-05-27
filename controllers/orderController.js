const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { generateInvoicePDF } = require('../utils/invoiceService');
const notificationService = require('../utils/notificationService');
const fs = require('fs');
const path = require('path');

// @desc  Create order with automatic tax, invoice generation & initial tracking
// @route POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, billingAddress, paymentMethod, couponCode, notes } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Calculate subtotal
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
      image: product.images[0]?.url || product.images[0] || '',
      price,
      quantity: item.quantity,
      variant: item.variant || {},
    });

    // Reduce stock
    product.stock -= item.quantity;
    await product.save();
  }

  const shippingCharge = subtotal >= 999 ? 0 : 99;
  const discount = 0; // standard coupon logic can be integrated

  // 18% GST Calculation (exclusive)
  const gstRate = 0.18;
  const taxAmount = (subtotal - discount) * gstRate;
  
  // Tax breakdown based on state (Freshnaps is in Maharashtra)
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  const stateStr = (shippingAddress.state || '').trim().toLowerCase();
  if (stateStr === 'maharashtra' || stateStr === 'mh') {
    cgst = taxAmount / 2;
    sgst = taxAmount / 2;
  } else {
    igst = taxAmount;
  }

  const totalAmount = subtotal - discount + shippingCharge + taxAmount;

  // Estimated delivery: 5 days from today
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

  // Shipment / courier details
  const deliveryPartners = ['Delhivery', 'Blue Dart', 'Shiprocket', 'NimbusPost'];
  const deliveryPartner = deliveryPartners[Math.floor(Math.random() * deliveryPartners.length)];
  const trackingId = 'FN' + Math.floor(1000000000 + Math.random() * 9000000000);

  const initialStatusHistory = [
    {
      status: 'placed',
      note: 'Order successfully created.',
      timestamp: new Date()
    }
  ];

  const initialTrackingHistory = [
    {
      status: 'placed',
      location: shippingAddress.city || 'Fulfillment Center',
      timestamp: new Date(),
      description: 'Order placed by buyer. Preparing package.'
    }
  ];

  const order = new Order({
    user: req.user._id,
    orderItems: enrichedItems,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    paymentMethod: paymentMethod || 'COD',
    paymentStatus: paymentMethod === 'Online' ? 'paid' : 'pending',
    subtotal,
    discount,
    shippingCharge,
    taxAmount,
    taxBreakdown: { cgst, sgst, igst },
    totalAmount,
    couponCode,
    notes,
    estimatedDelivery,
    deliveryPartner,
    shipmentProvider: deliveryPartner,
    trackingId,
    trackingHistory: initialTrackingHistory,
    statusHistory: initialStatusHistory,
  });

  // Generate Invoice PDF and save
  try {
    const invoiceUrl = await generateInvoicePDF(order);
    order.invoiceUrl = invoiceUrl;
  } catch (invoiceError) {
    console.error('Invoice PDF Generation Failed:', invoiceError);
  }

  await order.save();

  // Send Order Confirmation Notification
  try {
    await notificationService.sendOrderConfirmation(order, req.user);
  } catch (notifErr) {
    console.error('Notification error:', notifErr);
  }

  res.status(201).json({ success: true, order });
});

// @desc  Get my orders with filter and search
// @route GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const query = { user: req.user._id };

  if (status) {
    if (status === 'active') {
      query.orderStatus = { $in: ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery'] };
    } else if (status === 'delivered') {
      query.orderStatus = 'delivered';
    } else if (status === 'cancelled') {
      query.orderStatus = 'cancelled';
    } else if (status === 'returned') {
      query.orderStatus = { $in: ['returned', 'refunded'] };
    }
  }

  if (search) {
    if (search.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = search;
    } else {
      query['orderItems.name'] = { $regex: search, $options: 'i' };
    }
  }

  const orders = await Order.find(query).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc  Get single order
// @route GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  res.json({ success: true, order });
});

// @desc  Cancel order
// @route POST /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Cancellable before shipping
  const nonCancellable = ['shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'];
  if (nonCancellable.includes(order.orderStatus)) {
    res.status(400);
    throw new Error(`Order cannot be cancelled at this stage (${order.orderStatus})`);
  }

  const { reason } = req.body;
  order.orderStatus = 'cancelled';
  order.cancelReason = reason || 'Cancelled by customer';
  order.cancelDate = new Date();

  // Restore stock
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }

  order.statusHistory.push({
    status: 'cancelled',
    note: `Order cancelled. Reason: ${order.cancelReason}`,
    timestamp: new Date()
  });

  await order.save();

  // Send status update notification
  try {
    await notificationService.sendOrderStatusUpdate(order, req.user);
  } catch (notifErr) {
    console.error('Notification error:', notifErr);
  }

  res.json({ success: true, order });
});

// @desc  Request return for order
// @route POST /api/orders/:id/return
const returnOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (order.orderStatus !== 'delivered') {
    res.status(400);
    throw new Error('Only delivered orders can be returned');
  }

  // Validate return window (7 days)
  const deliveryDate = order.deliveredAt || order.updatedAt;
  const daysDiff = (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > 7) {
    res.status(400);
    throw new Error('Return window has expired (7 days max)');
  }

  const { reason, images } = req.body;
  order.returnStatus = 'requested';
  order.returnReason = reason || 'No reason provided';
  order.returnImages = images || [];
  order.returnRequestDate = new Date();

  order.statusHistory.push({
    status: 'returned',
    note: `Return requested. Reason: ${order.returnReason}`,
    timestamp: new Date()
  });

  await order.save();

  // Send return update notification
  try {
    await notificationService.sendReturnUpdate(order, req.user);
  } catch (notifErr) {
    console.error('Notification error:', notifErr);
  }

  res.json({ success: true, order });
});

// @desc  Reorder items (returns item data so frontend can easily add to cart)
// @route POST /api/orders/:id/reorder
const reorder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('orderItems.product');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json({ success: true, orderItems: order.orderItems });
});

// @desc  Stream generated PDF invoice
// @route GET /api/orders/:id/invoice
const getInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  let invoicePath = order.invoiceUrl;
  
  // Re-generate if path doesn't exist
  if (!invoicePath || !fs.existsSync(path.join(__dirname, '..', invoicePath))) {
    invoicePath = await generateInvoicePDF(order);
    order.invoiceUrl = invoicePath;
    await order.save();
  }

  const fullPath = path.join(__dirname, '..', invoicePath);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${order.invoiceNumber || 'invoice'}.pdf`);
  
  const fileStream = fs.createReadStream(fullPath);
  fileStream.pipe(res);
});

// @desc  Get shipment tracking info
// @route GET /api/orders/:id/tracking
const getTracking = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  res.json({
    success: true,
    tracking: {
      trackingId: order.trackingId,
      deliveryPartner: order.deliveryPartner,
      shipmentProvider: order.shipmentProvider,
      trackingHistory: order.trackingHistory || [],
      estimatedDelivery: order.estimatedDelivery,
      orderStatus: order.orderStatus,
    }
  });
});

// @desc  Add rating & review for product in a delivered order
// @route POST /api/orders/:id/review
const addReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  if (!productId || !rating || !comment) {
    res.status(400);
    throw new Error('Product ID, rating, and comment are required');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (order.orderStatus !== 'delivered') {
    res.status(400);
    throw new Error('You can only review delivered orders');
  }

  // Verify product was part of order
  const hasProduct = order.orderItems.some(item => item.product.toString() === productId);
  if (!hasProduct) {
    res.status(400);
    throw new Error('Product not found in this order');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if already reviewed by this user
  const alreadyReviewed = product.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  product.reviews.push(review);
  product.updateRating();
  await product.save();

  // Save review reference in order
  order.review = {
    rating: Number(rating),
    comment,
    createdAt: new Date(),
  };
  await order.save();

  res.status(201).json({ success: true, message: 'Review submitted successfully' });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  returnOrder,
  reorder,
  getInvoice,
  getTracking,
  addReview
};
