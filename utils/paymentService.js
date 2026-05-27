let Stripe;
let Razorpay;

try {
  Stripe = require('stripe');
} catch (e) {
  Stripe = null;
}

try {
  Razorpay = require('razorpay');
} catch (e) {
  Razorpay = null;
}

// Initialize Stripe if secret is set and package is available
const stripeInstance = (Stripe && process.env.STRIPE_SECRET_KEY)
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Initialize Razorpay if secret is set and package is available
const razorpayInstance = (Razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

/**
 * Creates a Stripe Checkout Session for order payment.
 * @param {Array} orderItems 
 * @param {number} totalAmount 
 * @param {string} orderId 
 * @returns {Promise<object>} Stripe Session object or Mock sandbox session
 */
const createStripeCheckoutSession = async (orderItems, totalAmount, orderId) => {
  const lineItems = orderItems.map(item => ({
    price_data: {
      currency: 'inr',
      product_data: {
        name: item.name || 'Premium Bedding Item',
        images: item.images || [],
      },
      unit_amount: Math.round(item.price * 100), // Stripe takes amounts in cents/paise
    },
    quantity: item.quantity,
  }));

  if (stripeInstance) {
    try {
      return await stripeInstance.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/orders/${orderId}?status=success`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout?status=cancelled`,
        client_reference_id: orderId.toString(),
        metadata: { orderId: orderId.toString() }
      });
    } catch (err) {
      console.error('Stripe SDK Checkout creation failed:', err.message);
      throw err;
    }
  } else {
    // Sandbox Mock Mode fallback
    console.log(`[SANDBOX MOCK] Generating mock Stripe Checkout Session for Order ${orderId}`);
    return {
      id: `mock_stripe_session_${crypto.randomUUID ? crypto.randomUUID().slice(0,8) : '1a2b3c4d'}`,
      url: `${process.env.FRONTEND_URL}/orders/${orderId}?status=success&mock=stripe`
    };
  }
};

/**
 * Creates a Razorpay Order.
 * @param {number} amount In Rupees
 * @param {string} orderId Local Database Order ID
 * @returns {Promise<object>} Razorpay Order object or Mock sandbox order
 */
const createRazorpayOrder = async (amount, orderId) => {
  const options = {
    amount: Math.round(amount * 100), // amount in paise
    currency: 'INR',
    receipt: `rcpt_${orderId.toString().slice(-12)}`,
    payment_capture: 1 // Auto-capture payments
  };

  if (razorpayInstance) {
    try {
      return await razorpayInstance.orders.create(options);
    } catch (err) {
      console.error('Razorpay SDK Order creation failed:', err.message);
      throw err;
    }
  } else {
    // Sandbox Mock Mode fallback
    console.log(`[SANDBOX MOCK] Generating mock Razorpay Order for Order ${orderId}`);
    return {
      id: `order_mock_${Math.random().toString(36).substring(2, 10)}`,
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      status: 'created'
    };
  }
};

module.exports = {
  createStripeCheckoutSession,
  createRazorpayOrder,
  stripeInstance,
  razorpayInstance
};
