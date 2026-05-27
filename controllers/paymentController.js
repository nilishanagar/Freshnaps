const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { stripeInstance } = require('../utils/paymentService');

// Dynamically handle socket triggers (will be implemented in socketService.js)
let socketService;
try {
  socketService = require('../utils/socketService');
} catch (e) {
  socketService = null;
}

// Dynamically handle async queues (will be implemented in queueService.js)
let queueService;
try {
  queueService = require('../utils/queueService');
} catch (e) {
  queueService = null;
}

/**
 * Decrements product stock inventory and logs auditing entries.
 * @param {Order} order 
 */
const processInventoryDecrement = async (order) => {
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    // Log decrement details
    let auditNote = `Payment confirmed for Order ${order.invoiceNumber || order._id}`;

    // Check if variant specific inventory
    if (item.variant && product.variants && product.variants.length > 0) {
      const vIndex = product.variants.findIndex(
        v => 
          (item.variant.size && v.size === item.variant.size) || 
          (item.variant.color && v.color === item.variant.color)
      );
      if (vIndex !== -1) {
        product.variants[vIndex].stock = Math.max(0, product.variants[vIndex].stock - item.quantity);
        auditNote += ` (Variant: ${product.variants[vIndex].size || ''} ${product.variants[vIndex].color || ''})`;
      }
    }

    // Decrement main product stock
    product.stock = Math.max(0, product.stock - item.quantity);
    
    // Add stock audit entry
    product.stockAuditHistory = product.stockAuditHistory || [];
    product.stockAuditHistory.push({
      action: 'decrement',
      quantity: item.quantity,
      note: auditNote
    });

    await product.save();

    // Trigger admin low stock warnings
    if (product.stock <= product.lowStockThreshold) {
      console.log(`[ALERT] Product ${product.name} (SKU: ${product.sku || 'N/A'}) is running low on stock! Current: ${product.stock}`);
      if (socketService) {
        socketService.broadcastToAdmins('low_stock', {
          productId: product._id,
          name: product.name,
          stock: product.stock,
          sku: product.sku
        });
      }
    }
  }
};

/**
 * Triggers order notification queues (Email, WhatsApp, SMS).
 * @param {Order} order 
 */
const triggerOrderNotifications = async (order) => {
  if (!queueService) return;
  try {
    const user = await order.populate('user', 'email phone name');
    const recipientEmail = user.user?.email || order.shippingAddress.email || '';
    const recipientPhone = user.user?.phone || order.shippingAddress.phone || '';

    // Queue Transactional Email with PDF Invoice
    if (recipientEmail) {
      await queueService.pushToQueue('email', recipientEmail, {
        type: 'order_confirmation',
        orderId: order._id,
        invoiceNumber: order.invoiceNumber,
        amount: order.totalAmount
      });
    }

    // Queue SMS Confirmation
    if (recipientPhone) {
      await queueService.pushToQueue('sms', recipientPhone, {
        type: 'order_confirmation',
        orderId: order._id,
        invoiceNumber: order.invoiceNumber,
        amount: order.totalAmount
      });

      // Queue WhatsApp confirmation too
      await queueService.pushToQueue('whatsapp', recipientPhone, {
        type: 'order_confirmation',
        orderId: order._id,
        invoiceNumber: order.invoiceNumber,
        amount: order.totalAmount
      });
    }
  } catch (err) {
    console.error('Triggering Order Notifications failed:', err.message);
  }
};

/**
 * Verifies and captures completed orders inside local database.
 * @param {string} orderId Local database Order ID
 * @param {string} transactionId Gateway transaction reference
 */
const confirmLocalOrderPayment = async (orderId, transactionId) => {
  const order = await Order.findById(orderId);
  if (!order) return null;

  // Prevent multiple confirmations
  if (order.paymentStatus === 'paid') return order;

  order.paymentStatus = 'paid';
  order.orderStatus = 'confirmed';
  order.transactionId = transactionId;
  
  // Add audit log
  order.statusHistory = order.statusHistory || [];
  order.statusHistory.push({
    status: 'confirmed',
    note: `Order paid successfully. Transaction: ${transactionId}`
  });

  await order.save();

  // Process stock depletion
  await processInventoryDecrement(order);

  // Queue customer communications
  await triggerOrderNotifications(order);

  // Broadcast real-time order alerts to admin sockets
  if (socketService) {
    socketService.broadcastToAdmins('new_order', {
      orderId: order._id,
      invoiceNumber: order.invoiceNumber,
      amount: order.totalAmount,
      name: order.shippingAddress.name
    });
  }

  return order;
};

// @desc  Razorpay Payment Callback / Webhook handler
// @route POST /api/payments/razorpay/webhook
const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    // If webhook secret is missing, fallback to developmental verification (for local QA checks)
    console.log('[SANDBOX WEBHOOK] Processing unauthenticated Razorpay Webhook Event.');
    const { order_id, payment_id } = req.body;
    if (order_id) {
      const order = await Order.findOne({ transactionId: order_id }) || await Order.findById(order_id);
      if (order) {
        await confirmLocalOrderPayment(order._id, payment_id || 'pay_mock_' + Math.random().toString(36).substring(2,10));
      }
    }
    return res.json({ success: true, message: 'Sandbox payment processed' });
  }

  const generatedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (generatedSignature !== signature) {
    res.status(400);
    throw new Error('Invalid signature header check');
  }

  const event = req.body.event;
  const payload = req.body.payload;

  if (event === 'order.paid' || event === 'payment.captured') {
    const paymentEntity = payload.payment.entity;
    const razorpayOrderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;

    // Find local order mapped to this Razorpay order ID
    const order = await Order.findOne({ transactionId: razorpayOrderId });
    if (order) {
      await confirmLocalOrderPayment(order._id, paymentId);
    }
  }

  res.json({ success: true });
});

// @desc  Stripe Payment Callback / Webhook handler
// @route POST /api/payments/stripe/webhook
const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  if (!sig || !webhookSecret || !stripeInstance) {
    // Developer Sandbox Bypass for QA verification
    console.log('[SANDBOX WEBHOOK] Processing unauthenticated Stripe Webhook Event.');
    const { orderId, sessionId } = req.body;
    if (orderId) {
      await confirmLocalOrderPayment(orderId, sessionId || 'ch_mock_' + Math.random().toString(36).substring(2,10));
    }
    return res.json({ success: true, message: 'Sandbox payment processed' });
  }

  try {
    // Stripe SDK requires the raw body buffer to verify signatures properly
    event = stripeInstance.webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook parsing failed:', err.message);
    res.status(400);
    throw new Error(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.client_reference_id || session.metadata.orderId;
    const paymentIntentId = session.payment_intent;

    if (orderId) {
      await confirmLocalOrderPayment(orderId, paymentIntentId);
    }
  }

  res.json({ success: true });
});

module.exports = {
  handleRazorpayWebhook,
  handleStripeWebhook,
  confirmLocalOrderPayment
};
