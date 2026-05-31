import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { removeFromCart, updateQuantity, selectCartItems, selectCartSubtotal } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const [coupon, setCoupon] = React.useState('');

  const shippingCharge = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shippingCharge;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-8xl">🛒</motion.div>
        <h2 className="section-title">Your Cart is Empty</h2>
        <p className="text-gray-500 max-w-sm">Looks like you haven't added any products to your cart yet. Explore our collection!</p>
        <Link to="/shop" className="btn-primary px-8 py-4">
          <ShoppingBag size={18} /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 py-10">
      <div className="container-custom">
        <h1 className="section-title mb-8">Shopping Cart <span className="text-primary-500 text-2xl">({items.length})</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(item => {
                const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
                return (
                  <motion.div
                    key={item.key}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card p-5 flex gap-4"
                  >
                    <Link to={`/product/${item.product.slug}`}>
                      <img
                        src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200'}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product.slug}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-500 transition-colors line-clamp-2">{item.product.name}</Link>
                      {item.variant && (
                        <p className="text-xs text-gray-400 mt-1">{item.variant.size && `Size: ${item.variant.size}`} {item.variant.color && `Color: ${item.variant.color}`}</p>
                      )}
                      <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-surface-800 rounded-xl p-1">
                          <button onClick={() => dispatch(updateQuantity({ key: item.key, quantity: item.quantity - 1 }))} className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-surface-700 flex items-center justify-center transition-all">
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                          <button onClick={() => dispatch(updateQuantity({ key: item.key, quantity: item.quantity + 1 }))} className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-surface-700 flex items-center justify-center transition-all">
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-bold text-gray-900 dark:text-white">{formatPrice(price * item.quantity)}</span>
                          <button
                            onClick={() => { dispatch(removeFromCart(item.key)); toast.success('Removed from cart'); }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div>
            <div className="card p-6 sticky top-24 space-y-5">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Order Summary</h2>

              {/* Coupon */}
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block flex items-center gap-1.5">
                  <Tag size={14} /> Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    placeholder="Enter code"
                    className="input text-sm flex-1"
                  />
                  <button className="btn-secondary text-sm px-4 py-2.5 flex-shrink-0">Apply</button>
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-100 dark:border-surface-800 pt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Shipping</span>
                  <span className={shippingCharge === 0 ? 'text-green-500 font-medium' : ''}>{shippingCharge === 0 ? 'FREE' : formatPrice(shippingCharge)}</span>
                </div>
                {subtotal < 999 && (
                  <p className="text-xs text-primary-500 bg-primary-50 dark:bg-primary-900/20 p-2.5 rounded-lg">
                    Add {formatPrice(999 - subtotal)} more for free shipping!
                  </p>
                )}
                <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-surface-800">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button onClick={() => navigate('/checkout')} className="btn-primary w-full py-4 text-base">
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <Link to="/shop" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors">
                <ShoppingBag size={14} /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
