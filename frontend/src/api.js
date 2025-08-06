import axios from 'axios';

// Get API URL from environment variable or use default
const API_URL = process.env.REACT_APP_API_URL || 'https://smartchain-ai-backend-imvu.onrender.com/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper to set token after login
export function setAuthToken(token) {
  localStorage.setItem('token', token);
}

export function logout() {
  localStorage.removeItem('token');
}

export async function updateProfile(data) {
  // Accepts name, phone, avatar, location, username
  return api.put('/auth/me', data);
}

export async function fetchProfile() {
  return api.get('/auth/me');
}

// --- Dashboard Data API Functions ---
export async function fetchDashboardKPIs() {
  const res = await api.get('/dashboard');
  return res.data;
}

export async function fetchSalesTrends() {
  const res = await api.get('/reports/sales-trends');
  return res.data;
}

export async function fetchRevenueTrends() {
  const res = await api.get('/reports/revenue-trends');
  return res.data;
}

export async function fetchCustomerStats() {
  const res = await api.get('/reports/customer-stats');
  return res.data;
}

export async function fetchAIInsights() {
  const res = await api.get('/ai/insights');
  return res.data;
}

export async function fetchPendingDeliveries() {
  const res = await api.get('/deliveries/pending');
  return res.data;
}

export async function markAsDelivered(id) {
  const res = await api.post(`/deliveries/${id}/mark_delivered`);
  return res.data;
}

export async function markAsShipped(id) {
  const res = await api.post(`/deliveries/${id}/mark_shipped`);
  return res.data;
}

export async function markAsCancelled(id) {
  const res = await api.post(`/deliveries/${id}/mark_cancelled`);
  return res.data;
}

export async function fetchCompletedStats() {
  const res = await api.get('/deliveries/completed_stats');
  return res.data;
}

export async function fetchDeliveryHistory() {
  const res = await api.get('/deliveries/history');
  return res.data;
}

export async function fetchPendingDeliveriesWithOrders() {
  const res = await api.get('/deliveries/pending_with_orders');
  return res.data;
}

export async function fetchDeliveryHistoryWithOrders() {
  const res = await api.get('/deliveries/history_with_orders');
  return res.data;
}

export async function placeOrder(payload) {
  console.log('Placing order to:', API_URL + '/orders/add', payload);
  return api.post('/orders/add/', payload);
}

export async function fetchVendors() {
  const res = await api.get('/vendor/all');
  return res.data;
}

export async function deleteDelivery(id) {
  return api.delete(`/deliveries/delete/${id}`);
}

export async function editDelivery(id, data) {
  const res = await api.put(`/deliveries/edit/${id}`, data);
  return res.data;
}

export async function fetchInventory() {
  const res = await api.get('/api/inventory');
  return res.data;
}

export async function fetchCategories() {
  const res = await api.get('/api/categories');
  return res.data;
}

export async function fetchShipments() {
  const res = await api.get('/shipments');
  return res.data;
}

export async function createReturn(data) {
  // data should include: id, date, customer, status
  return api.post('/returns', data);
}

export default api; 