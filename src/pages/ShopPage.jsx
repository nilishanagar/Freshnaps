import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { productService } from '../services';
import { setProducts, setFilters, setLoading } from '../store/slices/productSlice';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const categories = [
  { label: 'All Collection', slug: '' },
  { label: 'Mattresses', slug: 'mattress' },
  { label: 'Pillows', slug: 'pillow' },
  { label: 'Bedsheets', slug: 'bedsheet' },
  { label: 'Cushions', slug: 'cushion' },
  { label: 'Comforters', slug: 'comforter' },
  { label: 'Blankets', slug: 'blanket' },
  { label: 'Accessories & Protectors', slug: 'accessory' },
];

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
];

const categoryQuickTags = {
  '': [
    { label: 'Bestsellers Only', queryKey: 'bestseller', value: 'true' },
    { label: 'Orthopedic Support', queryKey: 'search', value: 'Orthopedic' },
    { label: 'Premium Bedding', queryKey: 'search', value: 'Cotton' },
    { label: 'Protectors & Accessories', queryKey: 'search', value: 'Protector' }
  ],
  'mattress': [
    { label: 'King Size', queryKey: 'search', value: 'King' },
    { label: 'Queen Size', queryKey: 'search', value: 'Queen' },
    { label: 'Single', queryKey: 'search', value: 'Single' },
    { label: 'Double', queryKey: 'search', value: 'Double' },
    { label: 'Memory Foam', queryKey: 'search', value: 'Foam' },
    { label: 'Orthopedic Support', queryKey: 'search', value: 'Orthopedic' },
    { label: 'Pocket Spring', queryKey: 'search', value: 'Spring' }
  ],
  'pillow': [
    { label: 'Memory Foam Pillows', queryKey: 'search', value: 'Foam' },
    { label: 'Orthopedic Pillows', queryKey: 'search', value: 'Orthorest' },
    { label: 'Natural Latex Pillows', queryKey: 'search', value: 'Latex' },
    { label: 'Soft Microfiber', queryKey: 'search', value: 'Fiber' }
  ],
  'bedsheet': [
    { label: 'Egyptian Cotton', queryKey: 'search', value: 'Cotton' },
    { label: 'Luxurious Silk', queryKey: 'search', value: 'Silk' },
    { label: 'Printed Sheets', queryKey: 'search', value: 'Printed' },
    { label: 'Solid Percale', queryKey: 'search', value: 'Solid' }
  ],
  'accessory': [
    { label: 'Mattress Protectors', queryKey: 'search', value: 'Protector' },
    { label: 'Luxury Toppers', queryKey: 'search', value: 'Topper' },
    { label: 'Duvet Covers', queryKey: 'search', value: 'Cover' }
  ]
};

// ──────────────────────────────────────────────
// Static fallback products (shown when API is unavailable)
// ──────────────────────────────────────────────
const MOCK_PRODUCTS = [
  {
    _id: '1', slug: 'cloud-comfort-memory-foam-mattress',
    name: 'Cloud Comfort Memory Foam Mattress',
    category: 'mattress',
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop'],
    price: 24999, discountPrice: 18999,
    rating: 4.8, numReviews: 124,
    createdAt: '2025-01-01',
  },
  {
    _id: '2', slug: 'royal-silk-pillowcase-set',
    name: 'Royal Silk Pillowcase Set',
    category: 'pillow',
    images: ['https://images.unsplash.com/photo-1592789705501-f9ae4278a9bc?w=800&auto=format&fit=crop'],
    price: 3499, discountPrice: 2499,
    rating: 4.9, numReviews: 89,
    createdAt: '2025-01-01',
  },
  {
    _id: '3', slug: 'velvet-comfort-cushion-set',
    name: 'Velvet Comfort Cushion Set',
    category: 'cushion',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop'],
    price: 2999, discountPrice: 1999,
    rating: 4.6, numReviews: 72,
    createdAt: '2025-01-01',
  },
  {
    _id: '4', slug: 'bamboo-mattress-protector',
    name: 'Bamboo Mattress Protector',
    category: 'accessory',
    images: ['https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800&auto=format&fit=crop'],
    price: 1999, discountPrice: 1399,
    rating: 4.6, numReviews: 211,
    createdAt: '2025-01-01',
  },
  {
    _id: '5', slug: 'cashmere-touch-weighted-blanket',
    name: 'Cashmere Touch Weighted Blanket',
    category: 'blanket',
    images: ['https://images.unsplash.com/photo-1576158114131-cc85ff77c72e?w=800&auto=format&fit=crop'],
    price: 5999, discountPrice: 4299,
    rating: 4.7, numReviews: 63,
    createdAt: '2025-01-01',
  },
  {
    _id: '6', slug: 'luxury-comfort-mattress-topper',
    name: 'Luxury Comfort Mattress Topper',
    category: 'accessory',
    images: ['https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800&auto=format&fit=crop'],
    price: 6999, discountPrice: 4999,
    rating: 4.8, numReviews: 142,
    createdAt: '2025-01-01',
  },
  {
    _id: '7', slug: 'linen-dreams-bedsheet-set',
    name: 'Linen Dreams Bedsheet Set',
    category: 'bedsheet',
    images: ['https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?w=800&auto=format&fit=crop'],
    price: 4999, discountPrice: 3499,
    rating: 4.7, numReviews: 156,
    createdAt: '2025-01-01',
  },
  {
    _id: '8', slug: 'all-season-goose-down-comforter',
    name: 'All-Season Goose Down Comforter',
    category: 'comforter',
    images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop'],
    price: 8999, discountPrice: 6499,
    rating: 4.8, numReviews: 98,
    createdAt: '2025-01-01',
  },
];

const ShopPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, isLoading, filters, pagination } = useSelector(s => s.products);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({ ...filters });
  const [minInput, setMinInput] = useState(filters.minPrice || '');
  const [maxInput, setMaxInput] = useState(filters.maxPrice || '');

  // Sync URL params to local filters
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured') || '';
    const bestseller = searchParams.get('bestseller') || '';
    const trending = searchParams.get('trending') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    setLocalFilters(prev => ({ ...prev, category: cat, search, featured, bestseller, trending, minPrice, maxPrice }));
    setMinInput(minPrice);
    setMaxInput(maxPrice);
  }, [searchParams]);

  // Fetch whenever localFilters change
  useEffect(() => {
    const fetchProducts = async () => {
      dispatch(setLoading(true));
      try {
        const params = {
          category: localFilters.category,
          search: localFilters.search,
          sort: localFilters.sort,
          minPrice: localFilters.minPrice,
          maxPrice: localFilters.maxPrice,
          page: localFilters.page,
          limit: 12,
          ...(localFilters.featured && { featured: localFilters.featured }),
          ...(localFilters.bestseller && { bestseller: localFilters.bestseller }),
          ...(localFilters.trending && { trending: localFilters.trending }),
        };
        const res = await productService.getAll(params);
        dispatch(setProducts(res.data));
      } catch (err) {
        console.error('Failed to fetch products:', err?.message || err);
        dispatch(setProducts({ products: [], page: 1, pages: 1, total: 0 }));
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchProducts();
  }, [localFilters, dispatch]);

  // Debounce minPrice filter
  useEffect(() => {
    const timer = setTimeout(() => {
      if (minInput !== localFilters.minPrice) {
        applyFilter('minPrice', minInput);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [minInput]);

  // Debounce maxPrice filter
  useEffect(() => {
    const timer = setTimeout(() => {
      if (maxInput !== localFilters.maxPrice) {
        applyFilter('maxPrice', maxInput);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [maxInput]);

  const applyFilter = (key, val) => {
    const newParams = {};
    searchParams.forEach((value, k) => {
      if (value) newParams[k] = value;
    });

    if (key === 'category') {
      delete newParams.search;
      if (val) {
        newParams.category = val;
      } else {
        delete newParams.category;
      }
    } else {
      if (val) {
        newParams[key] = val;
      } else {
        delete newParams[key];
      }
    }
    
    if (key !== 'page') {
      newParams.page = 1;
    }
    setSearchParams(newParams);

    setLocalFilters(prev => {
      const updated = { ...prev, [key]: val };
      if (key !== 'page') updated.page = 1;
      if (key === 'category') updated.search = '';
      return updated;
    });
    dispatch(setFilters({ 
      [key]: val, 
      ...(key !== 'page' && { page: 1 }), 
      ...(key === 'category' && { search: '' }) 
    }));
  };

  const renderSidebar = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <ChevronDown size={16} /> Category
        </h3>
        <div className="space-y-1.5">
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => applyFilter('category', cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                localFilters.category === cat.slug
                  ? 'bg-primary-500 text-white font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={minInput}
            onChange={e => setMinInput(e.target.value)}
            className="input text-sm"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={maxInput}
            onChange={e => setMaxInput(e.target.value)}
            className="input text-sm"
          />
        </div>
      </div>

      {/* Clear filters */}
      <button
        onClick={() => {
          setSearchParams({});
          const reset = { category: '', search: '', sort: 'newest', minPrice: '', maxPrice: '', page: 1 };
          setLocalFilters(reset);
          dispatch(setFilters(reset));
          setMinInput('');
          setMaxInput('');
        }}
        className="w-full btn-secondary text-sm"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950">
      {/* Header */}
      <div className="bg-surface-200 dark:bg-surface-900 border-b border-gray-100 dark:border-surface-800 py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white leading-tight">
                Shop All <span className="text-transparent bg-clip-text bg-brand-gradient">Products</span>
              </h1>
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-surface-800 px-3 py-1 rounded-full border border-primary-100 dark:border-surface-700 shadow-sm whitespace-nowrap animate-fade-in">
                {pagination.total > 0 ? `${pagination.total} Products` : '0 Products'}
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Premium Bedding &amp; Home Comfort
            </p>
          </div>

          {/* Sale Banner reference from Image 2 */}
          <div className="mt-6 relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 p-5 md:p-6 text-amber-950 shadow-sm border border-amber-300 flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Background floating decor */}
            <div className="absolute right-0 top-0 bottom-0 w-48 bg-white/10 rounded-l-full blur-xl pointer-events-none" />
            
            {/* Left Column: Title & Button */}
            <div className="flex items-center gap-6 flex-wrap sm:flex-nowrap w-full lg:w-auto justify-between sm:justify-start">
              <div className="text-left select-none pr-2">
                <div className="relative">
                  <h2 className="font-extrabold text-3xl md:text-4xl tracking-tighter uppercase leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                    SUMMER
                  </h2>
                  <span className="absolute -bottom-3 -right-3 font-display text-2xl md:text-3xl font-bold text-amber-900 italic rotate-[-5deg] drop-shadow-sm font-serif">
                    Sale
                  </span>
                </div>
              </div>
              <div className="h-10 w-[1px] bg-amber-950/20 hidden sm:block" />
              <button 
                onClick={() => {
                  applyFilter('bestseller', 'true');
                }} 
                className="px-6 py-2.5 bg-amber-950 hover:bg-amber-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.97] shadow-md hover:-translate-y-0.5"
              >
                Shop Now
              </button>
            </div>

            {/* Middle Divider */}
            <div className="h-12 w-[1px] bg-amber-950/20 hidden lg:block" />

            {/* Right Column: Offer details */}
            <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 lg:gap-8 w-full lg:w-auto">
              <div className="text-center sm:text-left flex-1 min-w-[120px]">
                <p className="font-extrabold text-xl lg:text-2xl leading-none mb-1">UP TO 70% OFF</p>
                <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">on selected products</p>
              </div>
              
              <div className="h-[1px] w-full bg-amber-950/10 sm:hidden" />
              
              <div className="grid grid-cols-2 gap-4 lg:gap-8 flex-1 w-full">
                <div className="text-center sm:text-left border-l border-amber-950/15 pl-4">
                  <p className="font-extrabold text-sm leading-tight text-amber-950">Extra 5% OFF</p>
                  <p className="text-[10px] font-semibold text-amber-900">on prepaid offers</p>
                </div>
                <div className="text-center sm:text-left border-l border-amber-950/15 pl-4">
                  <p className="font-extrabold text-sm leading-tight text-amber-950">Assured Free Gift</p>
                  <p className="text-[10px] font-semibold text-amber-900">on orders above ₹1499</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              {renderSidebar()}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Unified Toolbar: subcategory tabs, and sort select aligned in single horizontal line */}
            <div className="flex items-center justify-between gap-4 bg-gray-50 dark:bg-surface-900/60 p-3 rounded-2xl border border-gray-100 dark:border-surface-800/80 mb-6 flex-wrap lg:flex-nowrap">

              {/* Subcategory scroll pills */}
              <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {(categoryQuickTags[localFilters.category] || categoryQuickTags['']).map((tag, idx) => {
                  const isActive = localFilters[tag.queryKey] === tag.value;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (isActive) {
                          applyFilter(tag.queryKey, '');
                        } else {
                          applyFilter(tag.queryKey, tag.value);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-500 border-primary-500 text-white shadow-sm font-bold'
                          : 'bg-white dark:bg-surface-900 border-gray-200 dark:border-surface-800 text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-500'
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>

              {/* Sort by dropdown */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 bg-white dark:bg-surface-900 border border-gray-200 dark:border-surface-800 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  <SlidersHorizontal size={14} /> Filters
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Sort:</span>
                  <select
                    value={localFilters.sort}
                    onChange={e => applyFilter('sort', e.target.value)}
                    className="bg-white dark:bg-surface-900 border border-gray-200 dark:border-surface-800 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 outline-none focus:border-primary-500 min-w-[130px] shadow-sm cursor-pointer"
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products grid */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="xl" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🛏️</p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {items.map(product => <ProductCard key={product._id} product={product} />)}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pg => (
                      <button
                        key={pg}
                        onClick={() => applyFilter('page', pg)}
                        className={`w-10 h-10 rounded-xl font-medium text-sm transition-all ${
                          pagination.page === pg
                            ? 'bg-primary-500 text-white shadow-brand'
                            : 'bg-gray-100 dark:bg-surface-800 text-gray-600 dark:text-gray-300 hover:bg-primary-100'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 inset-y-0 w-80 bg-white dark:bg-surface-900 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900 dark:text-white">Filters</h2>
              <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
            </div>
            {renderSidebar()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
