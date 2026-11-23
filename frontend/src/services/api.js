import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Products ────────────────────────────────────────────
export const productApi = {
  getAll: (search) => api.get('/products', { params: search ? { search } : {} }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// ─── Inventory ───────────────────────────────────────────
export const inventoryApi = {
  addStock: (productId, quantity, source = 'MANUAL', notes = '') =>
    api.post('/inventory/add', { productId, quantity, source, notes }),
  removeStock: (productId, quantity, source = 'MANUAL', notes = '') =>
    api.post('/inventory/remove', { productId, quantity, source, notes }),
  getLowStock: () => api.get('/inventory/low-stock'),
  getTransactions: (limit = 50) => api.get('/inventory/transactions', { params: { limit } }),
  getProductTransactions: (productId) => api.get(`/inventory/transactions/${productId}`),
  getDashboard: () => api.get('/inventory/dashboard'),
};

// ─── Voice ───────────────────────────────────────────────
export const voiceApi = {
  parse: (text, userId = 1) => api.post('/voice/parse', { text, userId }),
  execute: (text, userId = 1) => api.post('/voice/execute', { text, userId }),
};

// ─── Auth ─────────────────────────────────────────────────
export const authApi = {
  login:    (email, password) => api.post('/auth/login',    { email, password }),
  register: (data)            => api.post('/auth/register', data),
};

// ─── Users ───────────────────────────────────────────────
export const userApi = {
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
};

export default api;
