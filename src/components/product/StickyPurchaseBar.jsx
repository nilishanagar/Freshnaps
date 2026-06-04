import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Zap } from 'lucide-react';

const formatPrice = (p) => `₹${p?.toLocaleString('en-IN')}`;

const StickyPurchaseBar = ({ productName, displayPrice, onAddToCart, onBuyNow, isOutOfStock }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-surface-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-surface-700 shadow-2xl"
        >
          <div className="container-custom flex items-center justify-between gap-4 py-3">
            <div className="flex-1 min-w-0 hidden sm:block">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{productName}</p>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white font-display">{formatPrice(displayPrice)}</p>
            </div>
            <div className="sm:hidden">
              <p className="text-lg font-extrabold text-gray-900 dark:text-white font-display">{formatPrice(displayPrice)}</p>
            </div>
            <div className="flex gap-2.5 flex-shrink-0">
              <button onClick={onAddToCart} disabled={isOutOfStock} className="px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-gradient text-white shadow-brand hover:shadow-brand-lg transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                <ShoppingCart size={14} /> <span className="hidden sm:inline">Add to Cart</span><span className="sm:hidden">Cart</span>
              </button>
              <button onClick={onBuyNow} disabled={isOutOfStock} className="px-5 py-2.5 rounded-xl font-bold text-xs border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-500 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                Buy Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyPurchaseBar;
