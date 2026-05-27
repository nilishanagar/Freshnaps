/**
 * Mock Notification Service
 * Simulates sending Email, SMS, and WhatsApp notifications to users.
 * Can be easily integrated with Nodemailer, Twilio, or WhatsApp Business API.
 */

const logNotification = (channel, recipient, subject, body) => {
  console.log(`\n=================== [MOCK NOTIFICATION VIA ${channel.toUpperCase()}] ===================`);
  console.log(`To      : ${recipient}`);
  if (subject) {
    console.log(`Subject : ${subject}`);
  }
  console.log(`Message : ${body}`);
  console.log(`========================================================================\n`);
};

const notificationService = {
  /**
   * Send order confirmation notification
   * @param {Object} order - Order document
   * @param {Object} user - User document containing email & phone
   */
  sendOrderConfirmation: async (order, user) => {
    const orderIdShort = order._id.toString().substring(18).toUpperCase();
    const recipientName = user.name || 'Valued Customer';
    
    // 1. Email Simulation
    const emailSubject = `Order Placed Successfully! - Freshnaps (Order #${orderIdShort})`;
    const emailBody = `Hi ${recipientName},\n\nThank you for choosing Freshnaps! Your order #${orderIdShort} has been successfully placed.\n\nTotal Amount: INR ${order.totalAmount.toFixed(2)}\nPayment Method: ${order.paymentMethod}\nEstimated Delivery: ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN') : 'Within 3-5 business days'}\n\nWe will notify you once your order is packed and shipped!\n\nBest regards,\nFreshnaps Team`;
    logNotification('email', user.email, emailSubject, emailBody);

    // 2. WhatsApp Simulation
    const waBody = `Hello ${recipientName}! 🛏️\nYour Freshnaps order *#${orderIdShort}* is confirmed! Total: INR ${order.totalAmount.toFixed(2)}. We are getting it ready for you. Track here: http://localhost:5173/orders/${order._id}`;
    logNotification('whatsapp', user.phone || 'N/A', null, waBody);
  },

  /**
   * Send order status update (e.g. Confirmed, Packed, Shipped, Out for Delivery, Delivered)
   * @param {Object} order - Order document
   * @param {Object} user - User document
   */
  sendOrderStatusUpdate: async (order, user) => {
    const orderIdShort = order._id.toString().substring(18).toUpperCase();
    const recipientName = user.name || 'Valued Customer';
    const status = order.orderStatus;

    let subject = '';
    let emailBody = '';
    let waBody = '';

    switch (status) {
      case 'confirmed':
        subject = `Your Freshnaps Order #${orderIdShort} has been Confirmed!`;
        emailBody = `Hi ${recipientName},\n\nGreat news! Your order #${orderIdShort} has been confirmed. Our warehouse is preparing your items.\n\nBest regards,\nFreshnaps Team`;
        waBody = `Hi ${recipientName}! 🌟 Your order *#${orderIdShort}* is now *Confirmed*. Our team is carefully packing your premium bedding.`;
        break;
      case 'packed':
        subject = `Your Freshnaps Order #${orderIdShort} is Packed!`;
        emailBody = `Hi ${recipientName},\n\nYour order #${orderIdShort} has been packed with love and care and is waiting for our courier partner to pick it up.\n\nBest regards,\nFreshnaps Team`;
        waBody = `Hi ${recipientName}! 📦 Exciting update! Your order *#${orderIdShort}* has been *Packed* and is ready for dispatch.`;
        break;
      case 'shipped':
        subject = `Shipped! Your Freshnaps Order #${orderIdShort} is on its way`;
        emailBody = `Hi ${recipientName},\n\nYour order #${orderIdShort} has been dispatched via ${order.deliveryPartner || 'our delivery partner'}.\n\nTracking ID: ${order.trackingId || 'N/A'}\nEstimated Delivery: ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN') : 'N/A'}\n\nTrack your live shipment details at http://localhost:5173/orders/${order._id}\n\nBest regards,\nFreshnaps Team`;
        waBody = `Woohoo ${recipientName}! 🚚 Your order *#${orderIdShort}* has been *Shipped* via ${order.deliveryPartner || 'Courier'}!\nTracking ID: *${order.trackingId || 'N/A'}*\nTrack live details here: http://localhost:5173/orders/${order._id}`;
        break;
      case 'out_for_delivery':
        subject = `Out for Delivery: Your Freshnaps Order #${orderIdShort} is arriving today!`;
        emailBody = `Hi ${recipientName},\n\nYour order #${orderIdShort} is out for delivery today with ${order.deliveryPartner || 'our delivery partner'}. Please keep your phone reachable.\n\nBest regards,\nFreshnaps Team`;
        waBody = `Hi ${recipientName}! 🛵 Your Freshnaps order *#${orderIdShort}* is *Out for Delivery* today! Our delivery partner will contact you shortly. Keep your phone handy!`;
        break;
      case 'delivered':
        subject = `Delivered! Enjoy your Freshnaps Experience`;
        emailBody = `Hi ${recipientName},\n\nYour order #${orderIdShort} has been successfully delivered. We hope you love your new sleep products!\n\nPlease take a moment to rate and review your products in your dashboard to help us improve.\n\nBest regards,\nFreshnaps Team`;
        waBody = `Hi ${recipientName}! 🎉 Your Freshnaps order *#${orderIdShort}* has been *Delivered* successfully!\nWe hope you have an amazing sleep. Share your review here: http://localhost:5173/orders/${order._id}`;
        break;
      case 'cancelled':
        subject = `Cancellation Confirmed: Order #${orderIdShort}`;
        emailBody = `Hi ${recipientName},\n\nAs requested, your order #${orderIdShort} has been cancelled. If any payment was made, a refund will be initiated according to our policy.\n\nReason: ${order.cancelReason || 'Customer requested'}\n\nBest regards,\nFreshnaps Team`;
        waBody = `Hi ${recipientName}, order *#${orderIdShort}* has been *Cancelled*. ${order.paymentStatus === 'paid' ? 'Your refund has been initiated and will reflect shortly.' : ''}`;
        break;
      default:
        return;
    }

    if (subject && emailBody) {
      logNotification('email', user.email, subject, emailBody);
    }
    if (waBody) {
      logNotification('whatsapp', user.phone || 'N/A', null, waBody);
    }
  },

  /**
   * Send return status update
   * @param {Object} order - Order document
   * @param {Object} user - User document
   */
  sendReturnUpdate: async (order, user) => {
    const orderIdShort = order._id.toString().substring(18).toUpperCase();
    const recipientName = user.name || 'Valued Customer';
    const returnStatus = order.returnStatus;

    let subject = '';
    let emailBody = '';
    let waBody = '';

    switch (returnStatus) {
      case 'requested':
        subject = `Return Request Received: Order #${orderIdShort}`;
        emailBody = `Hi ${recipientName},\n\nWe have received your return request for order #${orderIdShort}.\n\nReason: ${order.returnReason || 'N/A'}\nOur team will review the request within 24-48 hours.\n\nBest regards,\nFreshnaps Team`;
        waBody = `Hi ${recipientName}, we've received your return request for order *#${orderIdShort}*. We are reviewing it and will share pickup schedule shortly.`;
        break;
      case 'approved':
        subject = `Return Request Approved: Order #${orderIdShort}`;
        emailBody = `Hi ${recipientName},\n\nGood news! Your return request for order #${orderIdShort} has been approved.\n\nWe have scheduled a pickup for you. Please pack the items in their original packaging and keep them ready.\n\nBest regards,\nFreshnaps Team`;
        waBody = `Hi ${recipientName}! ✅ Your return request for *#${orderIdShort}* has been approved. A pickup executive will collect the package soon.`;
        break;
      case 'completed':
        subject = `Return Completed & Refund Initiated: Order #${orderIdShort}`;
        emailBody = `Hi ${recipientName},\n\nYour return for order #${orderIdShort} has been received and verified at our fulfillment center. We have initiated your refund.\n\nRefund Status: ${order.refundStatus.toUpperCase()}\n\nBest regards,\nFreshnaps Team`;
        waBody = `Hi ${recipientName}! Refund has been initiated for your returned order *#${orderIdShort}*. It should reflect in your account within 5-7 business days.`;
        break;
      default:
        return;
    }

    if (subject && emailBody) {
      logNotification('email', user.email, subject, emailBody);
    }
    if (waBody) {
      logNotification('whatsapp', user.phone || 'N/A', null, waBody);
    }
  }
};

module.exports = notificationService;
