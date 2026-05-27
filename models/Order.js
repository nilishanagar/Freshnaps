const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
  variant: { size: String, color: String },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
      name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Online'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'],
      default: 'placed',
    },
    billingAddress: {
      name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    taxAmount: { type: Number, default: 0 },
    taxBreakdown: {
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      igst: { type: Number, default: 0 },
    },
    invoiceNumber: String,
    invoiceUrl: String,
    estimatedDelivery: Date,
    deliveryPartner: String,
    shipmentProvider: String,
    trackingId: String,
    trackingHistory: [
      {
        status: String,
        location: String,
        timestamp: { type: Date, default: Date.now },
        description: String,
      }
    ],
    transactionId: String,
    refundStatus: {
      type: String,
      enum: ['none', 'initiated', 'approved', 'processed', 'refunded'],
      default: 'none',
    },
    refundAmount: { type: Number, default: 0 },
    refundReason: String,
    refundDate: Date,
    returnStatus: {
      type: String,
      enum: ['none', 'requested', 'approved', 'picked_up', 'received', 'completed'],
      default: 'none',
    },
    returnReason: String,
    returnImages: [String],
    returnRequestDate: Date,
    cancelReason: String,
    cancelDate: Date,
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      }
    ],
    review: {
      rating: Number,
      comment: String,
      images: [String],
      createdAt: Date,
    },
    subtotal: Number,
    discount: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    totalAmount: Number,
    couponCode: String,
    notes: String,
    deliveredAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
