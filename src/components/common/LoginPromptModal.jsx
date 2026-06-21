import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, X, Heart, ShoppingBag, UserCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * LoginPromptModal — A premium modal that prompts the user to login
 * when they try to perform actions like wishlist or buy now.
 *
 * @param {boolean}  isOpen   - Whether the modal is visible
 * @param {Function} onClose  - Callback to close the modal
 * @param {string}   action   - 'wishlist' | 'buy' — determines the messaging
 */
const LoginPromptModal = ({ isOpen, onClose, action = 'wishlist' }) => {
  const isWishlist = action === 'wishlist';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[201] flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-sm bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-surface-700 overflow-hidden pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-surface-800 hover:bg-gray-200 dark:hover:bg-surface-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all z-10 cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Icon Header */}
              <div className="pt-8 pb-4 flex flex-col items-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
                  isWishlist
                    ? 'bg-gradient-to-br from-red-400 to-pink-500'
                    : 'bg-brand-gradient'
                }`}>
                  {isWishlist
                    ? <Heart size={28} className="text-white" fill="white" />
                    : <ShoppingBag size={28} className="text-white" />
                  }
                </div>

                <h2 className="font-display text-xl font-extrabold text-gray-900 dark:text-white text-center">
                  {isWishlist ? 'Save to Wishlist' : 'Ready to Buy?'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1.5 px-6 leading-relaxed">
                  {isWishlist
                    ? 'Sign in to save your favorite items and access them anytime.'
                    : 'Sign in to place your order and enjoy a seamless checkout experience.'
                  }
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="px-6 pb-6 space-y-3">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-brand-gradient text-white shadow-brand hover:shadow-brand-lg transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] tracking-wide"
                >
                  <LogIn size={16} />
                  Sign In
                </Link>

                <Link
                  to="/register"
                  onClick={onClose}
                  className="w-full py-3.5 rounded-xl font-bold text-sm border-2 border-gray-200 dark:border-surface-600 text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  Create Account
                </Link>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginPromptModal;
