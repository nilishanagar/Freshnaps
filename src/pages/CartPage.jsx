import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Heart } from 'lucide-react';
import { removeFromCart, updateQuantity, selectCartItems, selectCartSubtotal } from '../store/slices/cartSlice';
import { toggleWishlistItem } from '../store/slices/wishlistSlice';
import { userService } from '../services';
import LoginPromptModal from '../components/common/LoginPromptModal';
import SEOHead from '../components/common/SEOHead';
import toast from 'react-hot-toast';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

const getSizeDimensions = (sizeName) => {
  if (!sizeName || sizeName.includes('(')) return '';
  const s = sizeName.toLowerCase();
  if (s.includes('single')) return ' (72" × 36" / 182 × 91 cm)';
  if (s.includes('double')) return ' (72" × 48" / 182 × 122 cm)';
  if (s.includes('queen')) return ' (72" × 60" / 182 × 152 cm)';
  if (s.includes('king')) return ' (72" × 72" / 182 × 182 cm)';
  return '';
};

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const { user } = useSelector(s => s.auth);
  const wishlistItems = useSelector(s => s.wishlist.items);
  const [coupon, setCoupon] = React.useState('');
  const [activeRemoveKey, setActiveRemoveKey] = React.useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const shippingCharge = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shippingCharge;

  const handleMoveToWishlist = async (item) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    const isInWishlist = wishlistItems.includes(item.product._id);
    if (!isInWishlist) {
      dispatch(toggleWishlistItem(item.product._id));
      try {
        await userService.toggleWishlist(item.product._id);
      } catch (err) {
        dispatch(toggleWishlistItem(item.product._id)); // Revert if API fails
        toast.error('Failed to update wishlist');
        return;
      }
    }
    dispatch(removeFromCart(item.key));
    toast.success('Moved to wishlist ❤️');
    setActiveRemoveKey(null);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-8xl">🛒</motion.div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white">Your Cart is <span className="text-transparent bg-clip-text bg-brand-gradient">Empty</span></h2>
        <p className="text-gray-500 max-w-sm">Looks like you haven't added any products to your cart yet. Explore our collection!</p>
        <Link to="/shop" className="btn-primary px-8 py-4">
          <ShoppingBag size={18} /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 py-10">
      <SEOHead title="Shopping Cart" noindex />
      <div className="container-custom">
        <h1 className="section-title mb-8">Shopping Cart <span className="text-primary-500 text-2xl">({items.length})</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(item => {
                const discountAmount = item.product.discountPrice > 0 ? (item.product.price - item.product.discountPrice) : 0;
                const price = (item.variant?.isCustom || item.variant?.priceCalculated)
                  ? item.variant.price 
                  : (item.variant?.price ? (item.variant.price - discountAmount) : (item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price));
                return (
                  <motion.div
                    key={item.key}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card p-5 flex flex-col gap-4"
                  >
                    <div className="flex gap-4">
                      <Link to={`/product/${item.product.slug}`}>
                        <img
                          src={item.product.images?.[0]?.url || item.product.images?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200'}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.product.slug}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-500 transition-colors line-clamp-2">{item.product.name}</Link>
                        
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-400">
                          {item.variant?.size && <span>Size: {item.variant.size}{getSizeDimensions(item.variant.size)}</span>}
                          {item.variant?.color && <span>Color: {item.variant.color}</span>}
                          {item.quantity > 1 && (
                            <span className="text-gray-400/80">({formatPrice(price)} each)</span>
                          )}
                        </div>

                        {/* Stock status and Free Shipping badges */}
                        <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold flex-wrap">
                          <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            In Stock
                          </span>
                          <span className="text-gray-300 dark:text-gray-700">•</span>
                          <span className="text-gray-455 dark:text-gray-400">✓ Free Shipping & Installation</span>
                        </div>

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
                              onClick={() => {
                                if (activeRemoveKey === item.key) {
                                  setActiveRemoveKey(null);
                                } else {
                                  setActiveRemoveKey(item.key);
                                }
                              }}
                              className={`transition-colors ${activeRemoveKey === item.key ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Inline remove options dropdown */}
                    {activeRemoveKey === item.key && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3.5 bg-gray-50 dark:bg-surface-900 rounded-xl border border-gray-150 dark:border-surface-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="font-semibold text-gray-700 dark:text-gray-300">
                          Remove this item or move it to your wishlist?
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => {
                              dispatch(removeFromCart(item.key));
                              toast.success('Removed from cart');
                              setActiveRemoveKey(null);
                            }}
                            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-extrabold rounded-lg transition-all cursor-pointer"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => handleMoveToWishlist(item)}
                            className="px-3.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 dark:text-primary-450 font-extrabold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Heart size={12} className="fill-current" />
                            Move to Wishlist
                          </button>
                          <button
                            onClick={() => setActiveRemoveKey(null)}
                            className="px-3.5 py-2 bg-gray-250 hover:bg-gray-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-gray-650 dark:text-gray-350 font-extrabold rounded-lg transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div>
            <div className="card p-6 sticky top-24 space-y-5">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Order <span className="text-transparent bg-clip-text bg-brand-gradient">Summary</span></h2>

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

    <LoginPromptModal
      isOpen={showLoginPrompt}
      onClose={() => setShowLoginPrompt(false)}
      action="wishlist"
    />
  </div>
  );
};

export default CartPage;
