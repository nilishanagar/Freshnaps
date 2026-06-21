import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlistItem } from '../../store/slices/wishlistSlice';
import { userService } from '../../services';
import LoginPromptModal from './LoginPromptModal';
import toast from 'react-hot-toast';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wishlist = useSelector(s => s.wishlist.items);
  const user = useSelector(s => s.auth.user);
  const isWishlisted = wishlist.includes(product._id);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    dispatch(toggleWishlistItem(product._id));
    
    try {
      await userService.toggleWishlist(product._id);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist ❤️');
    } catch (err) {
      dispatch(toggleWishlistItem(product._id)); // Revert on failure
      toast.error('Failed to sync wishlist');
    }
  };

  const hasDiscount = product.discountPrice > 0;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Extract warranty from product or features
  const warrantyText = product.warranty || 
    product.features?.find(f => f.toLowerCase().includes('warranty')) || 
    '5 Year Warranty';

  // Extract material or use a premium default
  const materialText = product.material || 
    product.tags?.find(t => t.toLowerCase() !== 'mattress') || 
    'Orthopedic Foam';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
        className="group flex flex-col h-full bg-white dark:bg-surface-900 rounded-2xl overflow-hidden"
      >
      <Link to={`/product/${product.slug}`} className="block h-full flex flex-col">
        {/* ── Visual Frame (Image area) ── */}
        <div className="relative overflow-hidden bg-surface-100 dark:bg-surface-950 aspect-square w-full">
          <img
            src={product.images?.[0]?.url || product.images?.[0] || `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800`}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
            loading="lazy"
          />

          {/* Warranty Badge (Top Left Overlay) */}
          <div className="absolute top-3 left-3">
            <span className="inline-block bg-[#dcfce7]/90 backdrop-blur-sm text-gray-700 dark:bg-surface-900/90 dark:text-gray-200 text-[10px] font-semibold px-2.5 py-1 rounded shadow-sm capitalize">
              {warrantyText.toLowerCase().replace('warranty', '').trim()} warranty
            </span>
          </div>

          {/* Rating Pill (Bottom Left Overlay) */}
          {product.rating > 0 && (
            <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-surface-900/95 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-800 dark:text-white">★</span>
              <span className="text-[10px] font-bold text-gray-800 dark:text-white">{product.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Floating Wishlist Heart (Bottom Right Overlay) */}
          <button
            onClick={handleWishlist}
            className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md bg-white hover:bg-red-50 text-gray-400 transition-all duration-200 z-10`}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={14} className={isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-500'} />
          </button>
        </div>

        {/* ── Product Specification Details (Info area) ── */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Title */}
            <h3 className="font-medium text-gray-900 dark:text-white text-sm md:text-[14px] leading-snug tracking-tight mb-1 font-sans group-hover:text-primary-600 transition-colors line-clamp-2">
              {product.name}
            </h3>

            {/* Sub-specification (Warranty & Foam type) */}
            <p className="text-gray-400 text-[11px] font-medium tracking-tight mb-2 uppercase font-sans">
              {warrantyText}, {materialText}
            </p>
          </div>

          {/* Price Area */}
          <div className="flex items-center gap-2 mt-auto">
            <span className="text-sm md:text-base font-bold text-gray-900 dark:text-white font-sans">
              {formatPrice(displayPrice)}
            </span>
            
            {hasDiscount && (
              <>
                <span className="text-xs text-gray-400 line-through font-sans">
                  {formatPrice(product.price)}
                </span>
                <span className="text-[11px] font-bold text-red-600 font-sans">
                  {discountPct}% off
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
      </motion.div>

      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        action="wishlist"
      />
    </>
  );
};

export default ProductCard;
