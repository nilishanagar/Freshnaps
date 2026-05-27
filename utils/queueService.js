const NotificationQueue = require('../models/NotificationQueue');

// Dynamic imports to prevent circular dependencies
let twilioService;
let whatsappService;
let resendService;

const lazyLoadServices = () => {
  if (!twilioService) twilioService = require('./twilioService');
  if (!whatsappService) whatsappService = require('./whatsappService');
  if (!resendService) resendService = require('./resendService');
};

/**
 * Pushes a new communication task into the MongoDB persistent outbox queue.
 * @param {string} channel 'email' | 'sms' | 'whatsapp'
 * @param {string} recipient Target email, phone number, etc.
 * @param {object} payload Message template IDs, dynamic context, etc.
 * @returns {Promise<NotificationQueue>} Saved database queue document
 */
const pushToQueue = async (channel, recipient, payload) => {
  try {
    const task = await NotificationQueue.create({
      channel,
      recipient,
      payload
    });
    console.log(`[QUEUE] Pushed ${channel} notification task into queue for ${recipient}`);
    return task;
  } catch (err) {
    console.error(`[QUEUE ERROR] Failed to push ${channel} to queue:`, err.message);
  }
};

/**
 * Processes a single notification item from the queue by calling the corresponding integration.
 * @param {NotificationQueue} task 
 */
const processNotificationItem = async (task) => {
  lazyLoadServices();
  const { channel, recipient, payload } = task;

  console.log(`[QUEUE WORKER] Executing pending ${channel} task for ${recipient}...`);

  switch (channel) {
    case 'email':
      if (payload.type === 'order_confirmation') {
        await resendService.sendOrderConfirmationEmail(recipient, payload);
      } else if (payload.type === 'verification') {
        await resendService.sendVerificationEmail(recipient, payload.token);
      } else if (payload.type === 'forgot_password') {
        await resendService.sendResetPasswordEmail(recipient, payload.token);
      } else {
        throw new Error(`Unsupported email payload type: ${payload.type}`);
      }
      break;

    case 'sms':
      if (payload.type === 'order_confirmation') {
        const text = `Hi! Freshnaps confirmed your premium bedding order ${payload.invoiceNumber}. Amount: ₹${payload.amount}. Thank you for sleeping premium!`;
        await twilioService.sendSMS(recipient, text);
      } else {
        await twilioService.sendSMS(recipient, payload.message || 'OTP Verification code is ' + payload.code);
      }
      break;

    case 'whatsapp':
      if (payload.type === 'order_confirmation') {
        // Build template parameters for WhatsApp Meta API
        const params = [
          { type: 'text', text: payload.invoiceNumber },
          { type: 'text', text: `₹${payload.amount}` }
        ];
        await whatsappService.sendWhatsAppTemplate(recipient, 'order_confirmed_premium', params);
      } else {
        await whatsappService.sendWhatsAppOTP(recipient, payload.code || '');
      }
      break;

    default:
      throw new Error(`Unsupported communication channel: ${channel}`);
  }
};

/**
 * Starts a persistent background polling worker interval checking for pending records.
 */
const startQueueWorker = () => {
  console.log('🚀 Asynchronous Notification Queue Worker has been initialized.');

  setInterval(async () => {
    try {
      // Find oldest pending records scheduled for execution
      const tasks = await NotificationQueue.find({
        status: 'pending',
        scheduledAt: { $lte: new Date() }
      })
        .sort({ createdAt: 1 })
        .limit(5); // Process up to 5 concurrent messages per tick

      if (tasks.length === 0) return;

      for (const task of tasks) {
        try {
          await processNotificationItem(task);
          
          // On success, flag sent
          task.status = 'sent';
          task.sentAt = new Date();
          task.lastError = '';
          await task.save();
          console.log(`[QUEUE WORKER] Successfully sent ${task.channel} task to ${task.recipient}`);
        } catch (err) {
          console.error(`[QUEUE WORKER ERROR] Dispatch failed for task ${task._id}:`, err.message);
          
          task.retryCount += 1;
          task.lastError = err.message || 'Unknown network gateway error';
          
          if (task.retryCount >= task.maxRetries) {
            task.status = 'failed';
            console.log(`[QUEUE WORKER] Task ${task._id} reached max retries. Flagging as FAILED.`);
          } else {
            // Calculate Exponential Backoff delay: 10s * 2^retryCount
            const backoffDelay = Math.pow(2, task.retryCount) * 10 * 1000;
            task.scheduledAt = new Date(Date.now() + backoffDelay);
            console.log(`[QUEUE WORKER] Rescheduled task ${task._id} to future: +${backoffDelay / 1000}s`);
          }
          await task.save();
        }
      }
    } catch (err) {
      console.error('[QUEUE WORKER CRITICAL] Loop exception:', err.message);
    }
  }, 5000); // Poll database every 5 seconds
};

module.exports = {
  pushToQueue,
  startQueueWorker
};
