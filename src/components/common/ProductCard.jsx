import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Eye, Zap } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlistItem } from '../../store/slices/wishlistSlice';
import { userService } from '../../services';
import toast from 'react-hot-toast';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wishlist = useSelector(s => s.wishlist.items);
  const user = useSelector(s => s.auth.user);
  const isWishlisted = wishlist.includes(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`Added to cart!`, { icon: '🛒' });
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.error('Please login to save to wishlist');

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

  const isNew = product.createdAt &&
    (Date.now() - new Date(product.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block bg-white dark:bg-navy-800 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 h-full">

        {/* ── Image ── */}
        <div className="relative overflow-hidden bg-cream-200 dark:bg-navy-700 aspect-[4/3]">
          <img
            src={product.images?.[0] || `https://picsum.photos/seed/${product._id}/800/600`}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${product._id}/800/600`; }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && (
              <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-sm">
                -{discountPct}% OFF
              </span>
            )}
            {product.isBestseller && (
              <span className="inline-flex items-center gap-1 bg-gold-500 text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-sm">
                <Star size={8} fill="currentColor" /> Bestseller
              </span>
            )}
            {product.isTrending && (
              <span className="inline-flex items-center gap-1 bg-navy-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-sm">
                <Zap size={8} fill="currentColor" /> Trending
              </span>
            )}
            {isNew && !product.isBestseller && !product.isTrending && (
              <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-sm">
                New
              </span>
            )}
          </div>

          {/* Action buttons — appear on hover */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button
              onClick={handleWishlist}
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm transition-all duration-200 ${
                isWishlisted
                  ? 'bg-red-50 text-red-500'
                  : 'bg-white/90 dark:bg-navy-800/90 text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); navigate(`/product/${product.slug}`); }}
              className="w-9 h-9 rounded-xl bg-white/90 dark:bg-navy-800/90 flex items-center justify-center shadow-md text-gray-400 hover:text-gold-500 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
              title="Quick view"
            >
              <Eye size={15} />
            </button>
          </div>

          {/* Add to cart — slides up on hover */}
          <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 bg-gold-gradient text-white text-sm font-semibold py-2.5 rounded-xl shadow-gold hover:shadow-gold-lg transition-shadow"
            >
              <ShoppingCart size={15} />
              Add to Cart
            </button>
          </div>
        </div>

        {/* ── Info ── */}
        <div className="p-4">
          {/* Category chip */}
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-gold-500 mb-1.5">
            {product.category}
          </span>

          {/* Name */}
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-2 line-clamp-2 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating > 0 ? (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    size={11}
                    className={i <= Math.round(product.rating) ? 'text-gold-400 fill-gold-400' : 'text-gray-200 dark:text-navy-600'}
                  />
                ))}
              </div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {product.rating.toFixed(1)}
                <span className="text-gray-400 dark:text-gray-500"> ({product.numReviews})</span>
              </span>
            </div>
          ) : (
            <div className="mb-3 h-4" />
          )}

          {/* Price row */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-gray-900 dark:text-white">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-[11px] text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-lg">
                Save {formatPrice(product.price - product.discountPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
