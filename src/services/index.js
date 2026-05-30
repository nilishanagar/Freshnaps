import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin-login', data),
  getMe: () => api.get('/auth/me'),
  otpRequest: (data) => api.post('/auth/otp-request', data),
  otpVerify: (data) => api.post('/auth/otp-verify', data),
  emailOtpRequest: (data) => api.post('/auth/email-otp-request', data),
  emailOtpVerify: (data) => api.post('/auth/email-otp-verify', data),
  resendSignupOtp: (data) => api.post('/auth/resend-signup-otp', data),
  googleLogin: (data) => api.post('/auth/google', data),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
};

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  getRelated: (slug) => api.get(`/products/${slug}/related`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

export const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id, data) => api.post(`/orders/${id}/cancel`, data),
  returnOrder: (id, data) => api.post(`/orders/${id}/return`, data),
  reorder: (id) => api.post(`/orders/${id}/reorder`),
  getInvoice: (id) => api.get(`/orders/${id}/invoice`, { responseType: 'blob' }),
  getTracking: (id) => api.get(`/orders/${id}/tracking`),
  addReview: (id, data) => api.post(`/orders/${id}/review`, data),
  confirmSandboxPayment: (orderId, sessionId) => api.post('/payments/stripe/webhook', { orderId, sessionId }),
};

export const userService = {
  updateProfile: (data) => api.put('/users/profile', data),
  addAddress: (data) => api.post('/users/addresses', data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  toggleWishlist: (productId) => api.post(`/users/wishlist/${productId}`),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),

  // Products
  getProducts: (params) => api.get('/admin/products', { params }),
  getProduct: (id) => api.get(`/admin/products/${id}`),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  checkSku: (sku, excludeId) =>
    api.get('/admin/products/check-sku', { params: { sku, excludeId } }),

  // Orders
  getOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),

  // Users
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data),

  // Uploads
  uploadImages: (formData) =>
    api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (publicId) => api.delete('/upload', { data: { publicId } }),
};

export const categoryService = {
  getAll: (params) => api.get('/categories', { params }),
  getTree: () => api.get('/categories/tree'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
};
