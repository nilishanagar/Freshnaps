import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { productService } from '../services';
import { setProducts, setFilters, setLoading } from '../store/slices/productSlice';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const categories = [
  { label: 'All', slug: '' },
  { label: 'Mattresses', slug: 'mattress' },
  { label: 'Pillows', slug: 'pillow' },
  { label: 'Bedsheets', slug: 'bedsheet' },
  { label: 'Cushions', slug: 'cushion' },
  { label: 'Comforters', slug: 'comforter' },
  { label: 'Blankets', slug: 'blanket' },
  { label: 'Curtains', slug: 'curtain' },
  { label: 'Accessories', slug: 'accessory' },
];

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
];

const ShopPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { items, isLoading, filters, pagination } = useSelector(s => s.products);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({ ...filters });

  // Sync URL params to local filters
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured') || '';
    const bestseller = searchParams.get('bestseller') || '';
    const trending = searchParams.get('trending') || '';
    setLocalFilters(prev => ({ ...prev, category: cat, search, featured, bestseller, trending }));
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
        console.error(err);
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchProducts();
  }, [localFilters, dispatch]);

  const applyFilter = (key, val) => {
    setLocalFilters(prev => ({ ...prev, [key]: val, page: 1 }));
    dispatch(setFilters({ [key]: val, page: 1 }));
  };

  const FilterSidebar = () => (
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
            value={localFilters.minPrice}
            onChange={e => setLocalFilters(prev => ({ ...prev, minPrice: e.target.value }))}
            onBlur={() => applyFilter('minPrice', localFilters.minPrice)}
            className="input text-sm"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={localFilters.maxPrice}
            onChange={e => setLocalFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
            onBlur={() => applyFilter('maxPrice', localFilters.maxPrice)}
            className="input text-sm"
          />
        </div>
      </div>

      {/* Clear filters */}
      <button
        onClick={() => {
          const reset = { category: '', search: '', sort: 'newest', minPrice: '', maxPrice: '', page: 1 };
          setLocalFilters(reset);
          dispatch(setFilters(reset));
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
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <FilterSidebar />
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
            <FilterSidebar />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
