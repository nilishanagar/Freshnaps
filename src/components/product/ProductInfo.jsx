import React from 'react';
import { Star, Heart, Share2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductInfo = ({ product, isWishlisted, onWishlistToggle }) => {
  const [showShare, setShowShare] = React.useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
    setShowShare(false);
  };

  return (
    <div className="space-y-3">
      {/* Row 1: Bestseller + Rating + Share */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          {product.isBestseller && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500">
              <Heart size={13} fill="currentColor" /> Best Seller
            </span>
          )}
          {product.rating > 0 && (
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="font-bold">{product.rating.toFixed(1)}</span>
              <span className="text-gray-400">({product.numReviews} Reviews)</span>
            </span>
          )}
        </div>

        {/* Share Button */}
        <div className="relative">
          <button
            onClick={() => setShowShare(!showShare)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-800 transition-all"
          >
            <Share2 size={16} />
          </button>
          {showShare && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-surface-900 border border-gray-200 dark:border-surface-700 rounded-lg shadow-xl p-1.5 z-20 min-w-[150px] animate-fade-in">
              <button onClick={handleCopyLink} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-800 rounded-md transition-colors">
                <Copy size={13} /> Copy Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Title */}
      <h1 className="font-display text-xl sm:text-2xl lg:text-[26px] font-bold text-gray-900 dark:text-white leading-snug">
        {product.name}
      </h1>
    </div>
  );
};

export default ProductInfo;
