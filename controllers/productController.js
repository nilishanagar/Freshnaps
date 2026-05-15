const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc  Get all products with filtering, search, pagination
// @route GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, sort, minPrice, maxPrice, page = 1, limit = 12, featured, bestseller, trending } = req.query;

  const query = { isActive: true };

  if (category) query.category = category;
  if (featured === 'true') query.isFeatured = true;
  if (bestseller === 'true') query.isBestseller = true;
  if (trending === 'true') query.isTrending = true;
  if (search) query.$text = { $search: search };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    'price-low': { price: 1 },
    'price-high': { price: -1 },
    rating: { rating: -1 },
    popular: { numReviews: -1 },
  };

  const sortBy = sortOptions[sort] || { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query).sort(sortBy).skip(skip).limit(Number(limit));

  res.json({
    success: true,
    products,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
});

// @desc  Get single product by slug
// @route GET /api/products/:slug
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('reviews.user', 'name avatar');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

// @desc  Get related products
// @route GET /api/products/:slug/related
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) return res.json({ success: true, products: [] });

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(4);

  res.json({ success: true, products: related });
});

// @desc  Add review to product
// @route POST /api/products/:id/reviews
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.updateRating();
  await product.save();

  res.status(201).json({ success: true, message: 'Review added' });
});

module.exports = { getProducts, getProductBySlug, getRelatedProducts, addReview };
