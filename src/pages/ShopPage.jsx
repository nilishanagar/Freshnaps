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
    { label: 'King Size Mattresses', queryKey: 'search', value: 'King' },
    { label: 'Queen Size Mattresses', queryKey: 'search', value: 'Queen' },
    { label: 'Single Mattresses', queryKey: 'search', value: 'Single' },
    { label: 'Double Mattresses', queryKey: 'search', value: 'Double' },
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
                  ? 'bg-gold-500 text-white font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700'
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
    <div className="min-h-screen bg-white dark:bg-navy-900">
      {/* Header */}
      <div className="bg-cream-200 dark:bg-navy-800 border-b border-gray-100 dark:border-navy-700 py-8">
        <div className="container-custom">
          <h1 className="section-title">Shop All Products</h1>
          <p className="section-subtitle">
            {pagination.total > 0 ? `${pagination.total} products found` : 'Browse our collection'}
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Horizontal scroll pill quick-filters */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                className={`px-5 py-2.5 rounded text-[13px] font-semibold tracking-tight whitespace-nowrap border transition-all duration-200 ${
                  isActive
                    ? 'bg-[#f6f2ed] border-gold-600 text-gold-700 font-bold shadow-sm'
                    : 'bg-white dark:bg-navy-800 border-gray-200 dark:border-navy-700 text-gray-700 dark:text-gray-300 hover:border-gold-500 hover:text-gold-500'
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              {renderSidebar()}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 btn-secondary text-sm"
              >
                <SlidersHorizontal size={16} /> Filters
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <label className="text-sm text-gray-500 dark:text-gray-400">Sort:</label>
                <select
                  value={localFilters.sort}
                  onChange={e => applyFilter('sort', e.target.value)}
                  className="input w-auto text-sm py-2"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
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
                            ? 'bg-gold-500 text-white shadow-gold'
                            : 'bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300 hover:bg-gold-100'
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
          <div className="absolute right-0 inset-y-0 w-80 bg-white dark:bg-navy-800 p-6 overflow-y-auto">
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
