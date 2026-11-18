import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pocket_paise_access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('pocket_paise_refresh');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('pocket_paise_access', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('pocket_paise_access');
          localStorage.removeItem('pocket_paise_refresh');
          localStorage.removeItem('pocket_paise_user');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('pocket_paise_access');
        localStorage.removeItem('pocket_paise_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login/', credentials),
  register: (data) => apiClient.post('/auth/register/', data),
  logout: (refreshToken) => apiClient.post('/auth/logout/', { refresh: refreshToken }),
  verifyEmail: (token) => apiClient.post('/auth/verify-email/', { token }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password/', { email }),
  resetPassword: (data) => apiClient.post('/auth/reset-password/', data),
  changePassword: (data) => apiClient.post('/auth/change-password/', data),
};

export const profileAPI = {
  getMe: () => apiClient.get('/me/'),
  updateMe: (data) => apiClient.patch('/me/', data),
  deleteMe: (password) => apiClient.delete('/me/', { data: { password } }),
};

export const dashboardAPI = {
  getSummary: (month) => apiClient.get('/dashboard/summary/', { params: { month } }),
  getSpendingByCategory: (month) => apiClient.get('/dashboard/spending-by-category/', { params: { month } }),
  getTrend: (months = 6) => apiClient.get('/dashboard/trend/', { params: { months } }),
};

export const transactionAPI = {
  list: (params) => apiClient.get('/transactions/', { params }),
  create: (data) => apiClient.post('/transactions/', data),
  get: (id) => apiClient.get(`/transactions/${id}/`),
  update: (id, data) => apiClient.patch(`/transactions/${id}/`, data),
  delete: (id) => apiClient.delete(`/transactions/${id}/`),
  exportUrl: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return `${API_BASE_URL}/transactions/export/${qs ? '?' + qs : ''}`;
  },
};

export const categoryAPI = {
  list: () => apiClient.get('/categories/'),
  create: (data) => apiClient.post('/categories/', data),
  update: (id, data) => apiClient.patch(`/categories/${id}/`, data),
  delete: (id) => apiClient.delete(`/categories/${id}/`),
};

export const budgetAPI = {
  list: (month) => apiClient.get('/budgets/', { params: { month } }),
  create: (data) => apiClient.post('/budgets/', data),
  update: (id, data) => apiClient.patch(`/budgets/${id}/`, data),
  delete: (id) => apiClient.delete(`/budgets/${id}/`),
  copyPrevious: (month) => apiClient.post('/budgets/copy-previous/', { month }),
};

export const goalAPI = {
  list: () => apiClient.get('/goals/'),
  create: (data) => apiClient.post('/goals/', data),
  get: (id) => apiClient.get(`/goals/${id}/`),
  update: (id, data) => apiClient.patch(`/goals/${id}/`, data),
  delete: (id) => apiClient.delete(`/goals/${id}/`),
  addContribution: (id, data) => apiClient.post(`/goals/${id}/contributions/`, data),
};

export const reportAPI = {
  getSummary: (from, to) => apiClient.get('/reports/summary/', { params: { from, to } }),
  exportUrl: (format = 'pdf', from = '', to = '') => {
    return `${API_BASE_URL}/reports/export/?format=${format}&from=${from}&to=${to}`;
  },
};

export const insightAPI = {
  getScore: (month) => apiClient.get('/insights/score/', { params: { month } }),
  getTips: (month) => apiClient.get('/insights/tips/', { params: { month } }),
};

export const notificationAPI = {
  list: () => apiClient.get('/notifications/'),
  markRead: (ids = []) => apiClient.post('/notifications/read/', { ids }),
  getUnreadCount: () => apiClient.get('/notifications/unread-count/'),
};

export default apiClient;
