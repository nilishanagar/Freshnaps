import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, Home, ShoppingBag } from 'lucide-react';
import { orderService } from '../services';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

const statusSteps = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getById(id)
      .then(res => setOrder(res.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-10">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h1 className="font-display text-4xl font-bold text-gray-900 dark:text-white mb-3">Order Placed!</h1>
          <p className="text-gray-500 text-lg">Thank you for your purchase. Your order is confirmed.</p>
          {order && <p className="text-gold-500 font-medium mt-2">Order ID: #{order._id.slice(-8).toUpperCase()}</p>}
        </motion.div>

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 mb-6">
            {/* Status tracker */}
            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
              {statusSteps.map((s, i) => {
                const currentIdx = statusSteps.indexOf(order.orderStatus);
                const isDone = i <= currentIdx;
                return (
                  <React.Fragment key={s}>
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDone ? 'bg-gold-500' : 'bg-gray-200 dark:bg-navy-700'}`}>
                        {isDone ? <CheckCircle size={16} className="text-white" /> : <span className="text-xs text-gray-400">{i+1}</span>}
                      </div>
                      <span className={`text-xs capitalize ${isDone ? 'text-gold-500 font-medium' : 'text-gray-400'}`}>{s}</span>
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 transition-all ${i < currentIdx ? 'bg-gold-500' : 'bg-gray-200 dark:bg-navy-700'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Shipping info */}
            {order.shippingAddress && (
              <div className="p-4 bg-cream-200 dark:bg-navy-800 rounded-xl mb-5">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2"><Home size={14} /> Delivering to</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{order.shippingAddress.name} • {order.shippingAddress.phone}</p>
                <p className="text-sm text-gray-500">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              </div>
            )}

            {/* Items */}
            <div className="space-y-3 mb-5">
              {order.orderItems.map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <img src={item.image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100'} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-100 dark:border-navy-700 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span className={order.shippingCharge === 0 ? 'text-green-500' : ''}>{order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}</span></div>
              <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-navy-700">
                <span>Total Paid</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <p className="text-xs text-gray-400">Payment: {order.paymentMethod}</p>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/profile?tab=orders" className="btn-secondary flex items-center justify-center gap-2">
            <Package size={16} /> My Orders
          </Link>
          <Link to="/shop" className="btn-primary flex items-center justify-center gap-2">
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
