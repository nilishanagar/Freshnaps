const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');

/* helpers */
const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// GET /api/categories  — list (optionally parent=id or parent=null for roots)
const getCategories = asyncHandler(async (req, res) => {
  const { parent } = req.query;
  const filter = { isActive: true };
  if (parent === 'null') filter.parent = null;
  else if (parent) filter.parent = parent;
  const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
  res.json({ success: true, categories });
});

// GET /api/categories/tree  — full nested tree
const getCategoryTree = asyncHandler(async (req, res) => {
  const all = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  const map = {};
  all.forEach((c) => { map[c._id] = { ...c, children: [] }; });
  const roots = [];
  all.forEach((c) => {
    if (c.parent && map[c.parent]) {
      map[c.parent].children.push(map[c._id]);
    } else {
      roots.push(map[c._id]);
    }
  });
  res.json({ success: true, categories: roots });
});

// POST /api/categories
const createCategory = asyncHandler(async (req, res) => {
  const { name, parent, image, description, sortOrder } = req.body;
  if (!name) { res.status(400); throw new Error('Category name is required'); }
  let slug = slugify(name);
  // Ensure slug uniqueness
  let i = 1;
  while (await Category.findOne({ slug })) { slug = `${slugify(name)}-${i++}`; }
  const category = await Category.create({ name, slug, parent: parent || null, image, description, sortOrder });
  res.status(201).json({ success: true, category });
});

// PUT /api/categories/:id
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, category });
});

// DELETE /api/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Category hidden' });
});

module.exports = { getCategories, getCategoryTree, createCategory, updateCategory, deleteCategory };
