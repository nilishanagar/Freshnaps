import { createSlice } from '@reduxjs/toolkit';

const loadCart = () => {
  try { return JSON.parse(localStorage.getItem('freshnaps_cart')) || []; } catch { return []; }
};

const saveCart = (items) => localStorage.setItem('freshnaps_cart', JSON.stringify(items));

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCart(),
    coupon: null,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, variant } = action.payload;
      const key = `${product._id}-${variant?.size || ''}-${variant?.color || ''}`;
      const existing = state.items.find(i => i.key === key);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ key, product, quantity, variant });
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i.key !== action.payload);
      saveCart(state.items);
    },
    updateQuantity: (state, action) => {
      const { key, quantity } = action.payload;
      const item = state.items.find(i => i.key === key);
      if (item) { item.quantity = Math.max(1, quantity); }
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      localStorage.removeItem('freshnaps_cart');
    },
    applyCoupon: (state, action) => { state.coupon = action.payload; },
    removeCoupon: (state) => { state.coupon = null; },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((acc, i) => acc + i.quantity, 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((acc, i) => {
    let price = i.product.discountPrice > 0 ? i.product.discountPrice : i.product.price;
    if (i.variant) {
      if (i.variant.isCustom || i.variant.priceCalculated) {
        // Price is already the final selling price (mattress volume-based pricing)
        price = i.variant.price;
      } else if (i.variant.price) {
        const discountAmount = i.product.discountPrice > 0 ? (i.product.price - i.product.discountPrice) : 0;
        price = i.variant.price - discountAmount;
      }
    }
    return acc + price * i.quantity;
  }, 0);

export default cartSlice.reducer;
