import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/api/settings'),
  updateSettings: (settings) => api.post('/api/settings', settings),
  getHistory: (limit = 10) => api.get(`/api/settings/history?limit=${limit}`),
};

// Logs API
export const logsAPI = {
  getLogs: (params = {}) => api.get('/api/logs', { params }),
  getLogDetail: (id) => api.get(`/api/logs/${id}`),
  exportCSV: (params = {}) => api.get('/api/logs/export/csv', { params }),
};

// Folders API
export const foldersAPI = {
  getFolders: (status = null) => {
    const params = status ? { status } : {};
    return api.get('/api/folders', { params });
  },
  scanFolders: () => api.post('/api/folders/scan'),
};

// Preflight API
export const preflightAPI = {
  runPreflight: (folderId) => api.post(`/api/preflight/${folderId}`),
  manualPreflight: (formData) => {
    return api.post('/api/preflight/manual', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  reprocess: (folderId) => api.post(`/api/reprocess/${folderId}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
};

export default api;
