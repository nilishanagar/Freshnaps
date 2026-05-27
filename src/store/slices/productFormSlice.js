import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '../../services';

const DRAFT_KEY = 'freshnaps_product_draft';

const defaultForm = {
  // Basic Info
  name: '',
  sku: '',
  barcode: '',
  brand: '',
  vendor: '',
  category: '',
  subcategory: '',
  tags: [],

  // Media
  images: [], // [{ url, publicId, isPrimary, sortOrder }]

  // Content
  shortDescription: '',
  description: '',
  material: '',
  washCare: '',
  warranty: '',

  // Pricing
  costPrice: '',
  price: '',
  discountPrice: '',
  taxPercent: '0',

  // Status
  status: 'draft',
  isFeatured: false,
  isBestseller: false,
  isTrending: false,
  isNewArrival: false,
  isVisible: true,
  isSearchable: true,
  showInRecommendations: true,
  scheduledAt: '',

  // Inventory
  stock: '',
  trackInventory: true,
  lowStockThreshold: '5',
  allowBackorders: false,
  warehouseLocation: '',

  // Variants
  hasVariants: false,
  variantAttributes: [], // [{ name: 'Size', values: ['S','M','L'] }]
  variants: [],          // generated combinations

  // Shipping
  weight: '',
  dimensions: { length: '', width: '', height: '' },
  shippingClass: 'standard',
  isFreeShipping: false,
  isCOD: true,

  // SEO
  seo: {
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    canonicalUrl: '',
    seoSlug: '',
    ogImage: '',
  },
};

/* ── Thunks ─────────────────────────────────────────── */

export const submitProduct = createAsyncThunk(
  'productForm/submit',
  async ({ data, editId }, { rejectWithValue }) => {
    try {
      const res = editId
        ? await adminService.updateProduct(editId, data)
        : await adminService.createProduct(data);
      return res.data.product;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.errors || err.response?.data?.message || err.message
      );
    }
  }
);

export const loadProductForEdit = createAsyncThunk(
  'productForm/loadForEdit',
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminService.getProduct(id);
      return res.data.product;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* ── Helpers ─────────────────────────────────────────── */

/** Map a DB product to form state */
const productToForm = (p) => ({
  ...defaultForm,
  name: p.name || '',
  sku: p.sku || '',
  barcode: p.barcode || '',
  brand: p.brand || '',
  vendor: p.vendor || '',
  category: p.category?._id || p.category || '',
  subcategory: p.subcategory || '',
  tags: p.tags || [],
  images: (p.images || []).map((img, i) => ({
    url: typeof img === 'string' ? img : img.url,
    publicId: img.publicId || '',
    isPrimary: img.isPrimary || i === 0,
    sortOrder: img.sortOrder ?? i,
  })),
  shortDescription: p.shortDescription || '',
  description: p.description || '',
  material: p.material || '',
  washCare: p.washCare || '',
  warranty: p.warranty || '',
  costPrice: p.costPrice ?? '',
  price: p.price ?? '',
  discountPrice: p.discountPrice ?? '',
  taxPercent: p.taxPercent ?? '0',
  status: p.status || 'draft',
  isFeatured: p.isFeatured || false,
  isBestseller: p.isBestseller || false,
  isTrending: p.isTrending || false,
  isNewArrival: p.isNewArrival || false,
  isVisible: p.isVisible !== false,
  isSearchable: p.isSearchable !== false,
  showInRecommendations: p.showInRecommendations !== false,
  stock: p.stock ?? '',
  trackInventory: p.trackInventory !== false,
  lowStockThreshold: p.lowStockThreshold ?? '5',
  allowBackorders: p.allowBackorders || false,
  warehouseLocation: p.warehouseLocation || '',
  hasVariants: p.hasVariants || false,
  variantAttributes: p.variantAttributes
    ? p.variantAttributes.map((name) => ({
        name,
        values: [...new Set((p.variants || []).map((v) => v.attributes?.get?.(name) || v.attributes?.[name] || '').filter(Boolean))],
      }))
    : [],
  variants: p.variants || [],
  weight: p.weight ?? '',
  dimensions: {
    length: p.dimensions?.length ?? '',
    width: p.dimensions?.width ?? '',
    height: p.dimensions?.height ?? '',
  },
  shippingClass: p.shippingClass || 'standard',
  isFreeShipping: p.isFreeShipping || false,
  isCOD: p.isCOD !== false,
  seo: {
    metaTitle: p.seo?.metaTitle || '',
    metaDescription: p.seo?.metaDescription || '',
    focusKeyword: p.seo?.focusKeyword || '',
    canonicalUrl: p.seo?.canonicalUrl || '',
    seoSlug: p.seo?.seoSlug || '',
    ogImage: p.seo?.ogImage || '',
  },
});

/* ── Slice ───────────────────────────────────────────── */

const productFormSlice = createSlice({
  name: 'productForm',
  initialState: {
    form: defaultForm,
    isDirty: false,
    lastSaved: null,        // ISO timestamp of last autosave
    isSaving: false,
    isSubmitting: false,
    submitErrors: null,
    uploadingCount: 0,      // tracks active image uploads
    isLoadingEdit: false,
  },

  reducers: {
    setField(state, { payload: { field, value } }) {
      // Support dot notation: "seo.metaTitle"
      const parts = field.split('.');
      if (parts.length === 2) {
        state.form[parts[0]][parts[1]] = value;
      } else {
        state.form[field] = value;
      }
      state.isDirty = true;
    },

    setForm(state, { payload }) {
      state.form = { ...state.form, ...payload };
      state.isDirty = true;
    },

    resetForm(state) {
      state.form = defaultForm;
      state.isDirty = false;
      state.lastSaved = null;
      state.submitErrors = null;
      localStorage.removeItem(DRAFT_KEY);
    },

    saveDraft(state) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(state.form));
      state.lastSaved = new Date().toISOString();
      state.isDirty = false;
      state.isSaving = false;
    },

    restoreDraft(state) {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          state.form = { ...defaultForm, ...JSON.parse(saved) };
          state.isDirty = false;
        }
      } catch { /* ignore */ }
    },

    clearSubmitErrors(state) {
      state.submitErrors = null;
    },

    addUploadingCount(state) {
      state.uploadingCount += 1;
    },

    decrementUploadingCount(state) {
      state.uploadingCount = Math.max(0, state.uploadingCount - 1);
    },

    addImages(state, { payload }) {
      // payload: [{ url, publicId, isPrimary }]
      const base = state.form.images.length;
      const newImgs = payload.map((img, i) => ({
        ...img,
        isPrimary: base === 0 && i === 0,
        sortOrder: base + i,
      }));
      state.form.images = [...state.form.images, ...newImgs];
      state.isDirty = true;
    },

    removeImage(state, { payload: index }) {
      state.form.images.splice(index, 1);
      // Re-assign sort orders
      state.form.images.forEach((img, i) => { img.sortOrder = i; });
      // Ensure at least one is primary
      if (state.form.images.length > 0 && !state.form.images.some((i) => i.isPrimary)) {
        state.form.images[0].isPrimary = true;
      }
      state.isDirty = true;
    },

    setPrimaryImage(state, { payload: index }) {
      state.form.images.forEach((img, i) => { img.isPrimary = i === index; });
      state.isDirty = true;
    },

    reorderImages(state, { payload }) {
      // payload: new ordered array of images
      state.form.images = payload.map((img, i) => ({ ...img, sortOrder: i }));
      state.isDirty = true;
    },

    setVariantAttributes(state, { payload }) {
      // payload: [{ name: 'Size', values: ['S','M','L'] }]
      state.form.variantAttributes = payload;
      state.isDirty = true;
    },

    setVariants(state, { payload }) {
      state.form.variants = payload;
      state.isDirty = true;
    },

    updateVariant(state, { payload: { index, data } }) {
      if (state.form.variants[index]) {
        state.form.variants[index] = { ...state.form.variants[index], ...data };
      }
      state.isDirty = true;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(submitProduct.pending, (state) => {
        state.isSubmitting = true;
        state.submitErrors = null;
      })
      .addCase(submitProduct.fulfilled, (state) => {
        state.isSubmitting = false;
        state.isDirty = false;
        localStorage.removeItem(DRAFT_KEY);
      })
      .addCase(submitProduct.rejected, (state, { payload }) => {
        state.isSubmitting = false;
        state.submitErrors = payload;
      })

      .addCase(loadProductForEdit.pending, (state) => {
        state.isLoadingEdit = true;
      })
      .addCase(loadProductForEdit.fulfilled, (state, { payload }) => {
        state.form = productToForm(payload);
        state.isDirty = false;
        state.isLoadingEdit = false;
      })
      .addCase(loadProductForEdit.rejected, (state) => {
        state.isLoadingEdit = false;
      });
  },
});

export const {
  setField, setForm, resetForm, saveDraft, restoreDraft, clearSubmitErrors,
  addUploadingCount, decrementUploadingCount,
  addImages, removeImage, setPrimaryImage, reorderImages,
  setVariantAttributes, setVariants, updateVariant,
} = productFormSlice.actions;

export default productFormSlice.reducer;
