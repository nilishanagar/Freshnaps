import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services';

// Async Thunks
export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderService.getMyOrders(params);
      return response.data.orders;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderDetail = createAsyncThunk(
  'order/fetchOrderDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.getById(id);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch order details');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await orderService.cancel(id, { reason });
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel order');
    }
  }
);

export const returnOrder = createAsyncThunk(
  'order/returnOrder',
  async ({ id, reason, images }, { rejectWithValue }) => {
    try {
      const response = await orderService.returnOrder(id, { reason, images });
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to submit return request');
    }
  }
);

export const reorderItems = createAsyncThunk(
  'order/reorderItems',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.reorder(id);
      return response.data.orderItems;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to process reorder');
    }
  }
);

export const fetchTracking = createAsyncThunk(
  'order/fetchTracking',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.getTracking(id);
      return response.data.tracking;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch tracking info');
    }
  }
);

export const submitReview = createAsyncThunk(
  'order/submitReview',
  async ({ id, productId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await orderService.addReview(id, { productId, rating, comment });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to submit review');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    currentOrder: null,
    tracking: null,
    loading: false,
    actionLoading: false,
    error: null,
    filters: {
      status: 'all',
      search: '',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { status: 'all', search: '' };
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.tracking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Order Detail
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentOrder = action.payload;
        // Update item in list
        const idx = state.orders.findIndex(o => o._id === action.payload._id);
        if (idx !== -1) state.orders[idx] = action.payload;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Return Order
      .addCase(returnOrder.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(returnOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentOrder = action.payload;
        const idx = state.orders.findIndex(o => o._id === action.payload._id);
        if (idx !== -1) state.orders[idx] = action.payload;
      })
      .addCase(returnOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Fetch Tracking
      .addCase(fetchTracking.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchTracking.fulfilled, (state, action) => {
        state.tracking = action.payload;
      })
      .addCase(fetchTracking.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Submit Review
      .addCase(submitReview.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(submitReview.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, clearCurrentOrder } = orderSlice.actions;

export default orderSlice.reducer;
