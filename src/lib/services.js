import api from '../utils/api';

import { clearAdminSession, getAdminToken, setAdminSession } from '../utils/adminAuth';

export const setAuthToken = (token) => {
  if (token) setAdminSession(token);
  else clearAdminSession();
};
export const getAuthToken = () => getAdminToken();

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authService = {
  async signUp(payload) {
    const { data } = await api.post('/auth/signup', payload);
    setAuthToken(data.token);
    return data;
  },
  async signIn(payload) {
    const { data } = await api.post('/auth/login', payload);
    setAuthToken(data.token);
    return data;
  },
  async profile() {
    const { data } = await api.get('/auth/profile');
    return data.user;
  },
  async forgotPassword(email) {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },
  async resetPassword(token, password) {
    const { data } = await api.post('/auth/reset-password', { token, password });
    return data;
  },
  signOut() { setAuthToken(null); },
};

export const storeService = {
  listPublicProducts: async (params = {}) => (await api.get('/products', { params })).data.items,
  getProductById: async (id) => (await api.get(`/products/${id}`)).data,
  listCategories: async () => (await api.get('/categories')).data,
  listBanners: async () => (await api.get('/banners')).data.filter((b) => b.active),
  getSiteSettings: async () => (await api.get('/settings')).data,
  submitEnquiry: async (payload) => (await api.post('/contact', payload)).data,
  getCart: async () => (await api.get('/cart')).data,
  upsertCartItem: async (payload) => (await api.post('/cart', payload)).data,
  removeCartItem: async (productId) => (await api.delete(`/cart/${productId}`)).data,
  getWishlist: async () => (await api.get('/wishlist')).data,
  toggleWishlist: async (product) => (await api.post('/wishlist', { product: product._id })).data,
  applyCoupon: async ({ code, subtotal }) => (await api.post('/coupons/apply', { code, subtotal })).data,
  placeOrder: async (payload) => (await api.post('/orders', payload)).data,
  myOrders: async () => (await api.get('/orders/mine')).data,
};

export const adminService = {
  getDashboard: async () => (await api.get('/admin/analytics')).data,
  listProducts: async () => (await api.get('/products', { params: { limit: 100 } })).data.items,
  createProduct: async (payload) => (await api.post('/products', payload)).data,
  updateProduct: async (id, payload) => (await api.put(`/products/${id}`, payload)).data,
  deleteProduct: async (id) => (await api.delete(`/products/${id}`)).data,
  listOrders: async () => (await api.get('/orders')).data,
  updateOrderStatus: async (id, payload) => (await api.patch(`/orders/${id}/status`, payload)).data,
  listUsers: async () => (await api.get('/users')).data,
  listBanners: async () => (await api.get('/banners')).data,
  createBanner: async (payload) => (await api.post('/banners', payload)).data,
  deleteBanner: async (id) => (await api.delete(`/banners/${id}`)).data,
  listEnquiries: async () => (await api.get('/contact')).data,
  markEnquiry: async (id, isRead) => (await api.patch(`/contact/${id}/read`, { isRead })).data,
  deleteEnquiry: async (id) => (await api.delete(`/contact/${id}`)).data,
  listCoupons: async () => (await api.get('/coupons')).data,
  createCoupon: async (payload) => (await api.post('/coupons', payload)).data,
  updateCoupon: async (id, payload) => (await api.put(`/coupons/${id}`, payload)).data,
  deleteCoupon: async (id) => (await api.delete(`/coupons/${id}`)).data,
  getSettings: async () => (await api.get('/settings')).data,
  saveSettings: async (payload) => (await api.put('/settings', payload)).data,
  listCategories: async () => (await api.get('/categories')).data,
  createCategory: async (payload) => (await api.post('/categories', payload)).data,
  deleteCategory: async (id) => (await api.delete(`/categories/${id}`)).data,
  uploadSingle: async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return (await api.post('/upload/single', fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
};
