const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc  Update user profile
// @route PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  if (req.body.avatar) user.avatar = req.body.avatar;
  if (req.body.password) user.password = req.body.password;

  await user.save();
  res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, role: user.role } });
});

// @desc  Add address
// @route POST /api/users/addresses
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
  user.addresses.push(req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// @desc  Delete address
// @route DELETE /api/users/addresses/:addressId
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// @desc  Toggle wishlist
// @route POST /api/users/wishlist/:productId
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;
  const idx = user.wishlist.indexOf(productId);
  if (idx > -1) {
    user.wishlist.splice(idx, 1);
  } else {
    await Product.findById(productId); // validate product exists
    user.wishlist.push(productId);
  }
  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
});

module.exports = { updateProfile, addAddress, deleteAddress, toggleWishlist };
