import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { authService } from '../services';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SEOHead from '../components/common/SEOHead';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await authService.getMe();
        if (res.data.success && res.data.user) {
          setWishlistItems(res.data.user.wishlist || []);
        }
      } catch (error) {
        toast.error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-950 py-10">
      <SEOHead title="My Wishlist" noindex />
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
            <p className="text-gray-500 mt-1">Products you've saved for later</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
            <Heart size={24} fill="currentColor" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : wishlistItems.length === 0 ? (
          <div className="card p-16 text-center max-w-2xl mx-auto mt-10">
            <Heart size={64} className="mx-auto text-gray-300 dark:text-surface-700 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8">You haven't saved any items yet. Start exploring our collections and save your favorite products!</p>
            <Link to="/shop" className="btn-primary inline-flex">
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
