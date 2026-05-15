import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    featured: [],
    bestsellers: [],
    trending: [],
    currentProduct: null,
    relatedProducts: [],
    isLoading: false,
    error: null,
    filters: { category: '', search: '', sort: 'newest', minPrice: '', maxPrice: '', page: 1 },
    pagination: { page: 1, pages: 1, total: 0 },
  },
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setProducts: (state, action) => {
      state.items = action.payload.products;
      state.pagination = { page: action.payload.page, pages: action.payload.pages, total: action.payload.total };
    },
    setFeatured: (state, action) => { state.featured = action.payload; },
    setBestsellers: (state, action) => { state.bestsellers = action.payload; },
    setTrending: (state, action) => { state.trending = action.payload; },
    setCurrentProduct: (state, action) => { state.currentProduct = action.payload; },
    setRelatedProducts: (state, action) => { state.relatedProducts = action.payload; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    resetFilters: (state) => { state.filters = { category: '', search: '', sort: 'newest', minPrice: '', maxPrice: '', page: 1 }; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setLoading, setProducts, setFeatured, setBestsellers, setTrending, setCurrentProduct, setRelatedProducts, setFilters, resetFilters, setError } = productSlice.actions;
export default productSlice.reducer;
