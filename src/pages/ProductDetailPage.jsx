import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Star, Truck, RotateCcw, Shield, ChevronLeft, ChevronRight, Minus, Plus, Zap } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { productService } from '../services';
import { setCurrentProduct, setRelatedProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlistItem } from '../store/slices/wishlistSlice';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

const ProductDetailPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct: product, relatedProducts } = useSelector(s => s.products);
  const wishlist = useSelector(s => s.wishlist.items);
  const { user } = useSelector(s => s.auth);

  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [tab, setTab] = useState('description');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [prod, related] = await Promise.all([
          productService.getBySlug(slug),
          productService.getRelated(slug),
        ]);
        dispatch(setCurrentProduct(prod.data.product));
        dispatch(setRelatedProducts(related.data.products));
        if (prod.data.product.variants?.length > 0) setSelectedVariant(prod.data.product.variants[0]);
        setActiveImg(0);
      } catch (err) {
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug, dispatch, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="xl" /></div>;
  if (!product) return null;

  const isWishlisted = wishlist.includes(product._id);
  const hasDiscount = product.discountPrice > 0;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPct = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity, variant: selectedVariant }));
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ product, quantity, variant: selectedVariant }));
    navigate('/checkout');
  };

  const handleWishlist = () => {
    dispatch(toggleWishlistItem(product._id));
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-navy-900">
      {/* Breadcrumb */}
      <div className="container-custom pt-6 pb-2">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-gold-500">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gold-500">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-gold-500 capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300 line-clamp-1">{product.name}</span>
        </nav>
      </div>

      {/* Product */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image gallery */}
          <div>
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-cream-200 dark:bg-navy-800 mb-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={product.images?.[activeImg] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Nav arrows */}
              {product.images?.length > 1 && (
                <>
                  <button onClick={() => setActiveImg(i => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-navy-800/80 flex items-center justify-center shadow-md hover:bg-white transition-all">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setActiveImg(i => (i + 1) % product.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-navy-800/80 flex items-center justify-center shadow-md hover:bg-white transition-all">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {hasDiscount && <span className="badge bg-red-500 text-white text-sm px-3">{discountPct}% OFF</span>}
                {product.isBestseller && <span className="badge bg-gold-500 text-white text-sm px-3">Bestseller</span>}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImg === i ? 'border-gold-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <p className="text-gold-500 font-medium uppercase tracking-widest text-sm capitalize mb-2">{product.category}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">{product.name}</h1>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={16} className={s <= Math.round(product.rating) ? 'text-gold-400 fill-gold-400' : 'text-gray-200 dark:text-navy-600'} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{product.rating.toFixed(1)} ({product.numReviews} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(displayPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-400 line-through">{formatPrice(product.price)}</span>
                  <span className="badge bg-red-100 text-red-600 text-sm px-2">Save {formatPrice(product.price - product.discountPrice)}</span>
                </>
              )}
            </div>

            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{product.shortDescription || product.description.slice(0, 150) + '...'}</p>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {product.variants[0]?.size ? 'Select Size' : 'Select Color'}:
                  {selectedVariant && <span className="text-gold-500 ml-2">{selectedVariant.size || selectedVariant.color}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        selectedVariant === v
                          ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20 text-gold-700 dark:text-gold-400'
                          : 'border-gray-200 dark:border-navy-600 text-gray-600 dark:text-gray-300 hover:border-gold-300'
                      }`}
                    >
                      {v.size || v.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-navy-700 rounded-xl p-1">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg hover:bg-white dark:hover:bg-navy-600 flex items-center justify-center transition-all">
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-9 h-9 rounded-lg hover:bg-white dark:hover:bg-navy-600 flex items-center justify-center transition-all">
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-sm text-gray-400">{product.stock} in stock</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button onClick={handleAddToCart} className="btn-secondary flex-1 py-3.5">
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button onClick={handleBuyNow} className="btn-primary flex-1 py-3.5">
                <Zap size={18} /> Buy Now
              </button>
              <button onClick={handleWishlist} className={`p-3.5 rounded-xl border-2 transition-all ${isWishlisted ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 dark:border-navy-600 text-gray-400 hover:border-red-300 hover:text-red-500'}`}>
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-cream-200 dark:bg-navy-800 rounded-2xl text-center">
              {[
                { icon: Truck, text: 'Free Delivery' },
                { icon: RotateCcw, text: '30-Day Return' },
                { icon: Shield, text: 'Warranty' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5">
                  <Icon size={18} className="text-gold-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="flex gap-1 border-b border-gray-200 dark:border-navy-700 mb-8">
            {['description', 'features', 'reviews'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
                  tab === t ? 'border-gold-500 text-gold-600 dark:text-gold-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {tab === 'description' && (
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">{product.description}</p>
              )}
              {tab === 'features' && (
                <ul className="space-y-3 max-w-xl">
                  {product.features?.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <span className="w-5 h-5 rounded-full bg-gold-100 dark:bg-gold-900/30 text-gold-600 flex items-center justify-center text-xs font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {tab === 'reviews' && (
                <div>
                  {product.reviews?.length > 0 ? (
                    <div className="space-y-4 max-w-2xl">
                      {product.reviews.map((r, i) => (
                        <div key={i} className="card p-5">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{r.name}</p>
                              <div className="flex gap-0.5 mt-1">
                                {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.rating ? 'text-gold-400 fill-gold-400' : 'text-gray-200'} />)}
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                  )}
                  {!user && (
                    <p className="mt-6 text-sm text-gray-500"><Link to="/login" className="text-gold-500 hover:underline">Login</Link> to write a review.</p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="section-title mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
