const mongoose = require('mongoose');

/* ── Sub-schemas ─────────────────────────────────────── */

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, default: '' }, // Cloudinary public_id (empty for local)
  isPrimary: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
});

const variantSchema = new mongoose.Schema({
  name: { type: String, default: '' }, // e.g. "Single / White"
  sku: { type: String, default: '' },
  price: { type: Number, default: 0 },
  discountPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  // Attributes map — e.g. { Size: "Single", Color: "White" }
  attributes: { type: Map, of: String, default: {} },
  images: [imageSchema],
  isActive: { type: Boolean, default: true },
});

const seoSchema = new mongoose.Schema({
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  focusKeyword: { type: String, default: '' },
  canonicalUrl: { type: String, default: '' },
  seoSlug: { type: String, default: '' },
  ogImage: { type: String, default: '' },
});

const dimensionsSchema = new mongoose.Schema({
  length: { type: Number, default: 0 },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
});

const stockAuditSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['decrement', 'restock', 'cancelled', 'adjustment'],
  },
  quantity: Number,
  timestamp: { type: Date, default: Date.now },
  note: String,
});

/* ── Main Product Schema ─────────────────────────────── */

const productSchema = new mongoose.Schema(
  {
    /* Basic Info */
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, unique: true, sparse: true, trim: true },
    barcode: { type: String, default: '' },
    brand: { type: String, default: '' },
    vendor: { type: String, default: '' },

    /* Category (dynamic) */
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    subcategory: { type: String, default: '' },
    // Legacy string field kept for backward compat with seeder
    categoryLegacy: { type: String, default: '' },

    /* Tags */
    tags: [String],

    /* Media */
    images: [imageSchema],

    /* Content */
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' }, // HTML from rich text editor
    material: { type: String, default: '' },
    washCare: { type: String, default: '' },
    warranty: { type: String, default: '' },

    /* Pricing */
    costPrice: { type: Number, default: 0 },
    price: { type: Number, required: true, min: 0 }, // MRP / base price
    discountPrice: { type: Number, default: 0 },     // selling price
    taxPercent: { type: Number, default: 0 },

    /* Status */
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
    isSearchable: { type: Boolean, default: true },
    showInRecommendations: { type: Boolean, default: true },
    scheduledAt: { type: Date, default: null },

    /* Inventory */
    stock: { type: Number, default: 0 },
    trackInventory: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 5 },
    allowBackorders: { type: Boolean, default: false },
    reservedStock: { type: Number, default: 0 },
    warehouseLocation: { type: String, default: '' },
    stockAuditHistory: [stockAuditSchema],

    /* Variants */
    hasVariants: { type: Boolean, default: false },
    variantAttributes: [String], // e.g. ["Size", "Color"]
    variants: [variantSchema],

    /* Shipping */
    weight: { type: Number, default: 0 }, // kg
    dimensions: { type: dimensionsSchema, default: {} },
    shippingClass: { type: String, default: 'standard' },
    isFreeShipping: { type: Boolean, default: false },
    isCOD: { type: Boolean, default: true },

    /* SEO */
    seo: { type: seoSchema, default: {} },

    /* Reviews */
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    /* Features list */
    features: [String],
  },
  { timestamps: true }
);

/* ── Indexes ─────────────────────────────────────────── */
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ status: 1, isActive: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1, isBestseller: 1, isTrending: 1 });

/* ── Methods ─────────────────────────────────────────── */
productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.numReviews = this.reviews.length;
    this.rating =
      this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);
