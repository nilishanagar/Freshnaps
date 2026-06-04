import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingCart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';
import SectionHeading from './SectionHeading';

const formatPrice = (p) => `₹${p?.toLocaleString('en-IN')}`;
const getImageUrl = (img) => {
  if (typeof img === 'string') return img;
  if (img?.url) return img.url;
  return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';
};

const FrequentlyBoughtTogether = ({ currentProduct, relatedProducts }) => {
  const dispatch = useDispatch();
  if (!relatedProducts?.length || relatedProducts.length < 2) return null;

  const bundleItems = [currentProduct, relatedProducts[0], relatedProducts[1]];
  const totalPrice = bundleItems.reduce((sum, p) => sum + (p.discountPrice > 0 ? p.discountPrice : p.price), 0);
  const bundlePrice = Math.round(totalPrice * 0.9);
  const savings = totalPrice - bundlePrice;

  const handleAddBundle = () => {
    bundleItems.forEach(product => {
      dispatch(addToCart({ product, quantity: 1, variant: product.variants?.[0] || null }));
    });
    toast.success('Bundle added to cart!');
  };

  return (
    <div>
      <SectionHeading eyebrow="Save More" title="Frequently Bought" gradient="Together" />
      <div className="bg-white dark:bg-surface-950 rounded-xl border border-gray-200 dark:border-surface-700 p-6">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          {bundleItems.map((item, i) => (
            <React.Fragment key={item._id}>
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center flex-1 min-w-0">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-50 dark:bg-surface-900 border border-gray-200 dark:border-surface-700 mb-3">
                  <img src={getImageUrl(item.images?.[0])} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-medium text-gray-800 dark:text-white line-clamp-2 max-w-[150px]">{item.name}</p>
                <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mt-1">
                  {formatPrice(item.discountPrice > 0 ? item.discountPrice : item.price)}
                </p>
              </motion.div>
              {i < bundleItems.length - 1 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
                  <Plus size={16} className="text-gray-400" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-6 pt-5 border-t border-gray-200 dark:border-surface-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-gray-900 dark:text-white font-display">{formatPrice(bundlePrice)}</span>
              <span className="text-sm text-gray-400 line-through">{formatPrice(totalPrice)}</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Save {formatPrice(savings)} with bundle</p>
          </div>
          <button onClick={handleAddBundle} className="px-6 py-3 bg-brand-gradient text-white font-bold text-sm rounded-xl shadow-brand hover:shadow-brand-lg transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
            <ShoppingCart size={16} /> Add Bundle to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrequentlyBoughtTogether;
