const mongoose = require('mongoose');

const notificationQueueSchema = new mongoose.Schema(
  {
    channel: {
      type: String,
      required: true,
      enum: ['email', 'sms', 'whatsapp'],
    },
    recipient: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 5,
    },
    lastError: {
      type: String,
      default: '',
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    sentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexing for rapid queue searches by worker
notificationQueueSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model('NotificationQueue', notificationQueueSchema);
