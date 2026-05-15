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
      enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    subtotal: Number,
    discount: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    totalAmount: Number,
    couponCode: String,
    notes: String,
    deliveredAt: Date,
    trackingNumber: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
