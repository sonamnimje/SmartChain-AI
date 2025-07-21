import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000'; // Update if backend runs elsewhere

const api = axios.create({
  baseURL: API_BASE_URL,
  // Do NOT set default Content-Type here; let Axios/browser handle it per request
});

// Attach JWT token to all requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access'); // Changed from 'token' to 'access'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to set token after login
export function setAuthToken(token) {
  localStorage.setItem('access', token); // Changed from 'token' to 'access'
}

export function logout() {
  localStorage.removeItem('access'); // Changed from 'token' to 'access'
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
  console.log('Placing order to:', API_BASE_URL + '/orders/add', payload);
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