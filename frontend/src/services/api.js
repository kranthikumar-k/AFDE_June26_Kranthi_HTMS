import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
});

export const ticketAPI = {
  getAll:    (params)   => API.get('/tickets/',    { params }),
  getOne:    (id)       => API.get(`/tickets/${id}`),
  create:    (data)     => API.post('/tickets/',   data),
  update:    (id, data) => API.put(`/tickets/${id}`, data),
  delete:    (id)       => API.delete(`/tickets/${id}`),
  search:    (q)        => API.get('/search',      { params: { q } }),
  dashboard: ()         => API.get('/dashboard'),
  count:     (params)   => API.get('/tickets/count', { params }),
};

export const metaAPI = {
  categories:  () => API.get('/meta/categories'),
  priorities:  () => API.get('/meta/priorities'),
  statuses:    () => API.get('/meta/statuses'),
  departments: () => API.get('/meta/departments'),
};

// ── Phase 2 Analytics ────────────────────────────────────────
export const analyticsAPI = {
  dashboard:      () => API.get('/analytics/dashboard'),
  categories:     () => API.get('/analytics/categories'),
  priorities:     () => API.get('/analytics/priorities'),
  departments:    () => API.get('/analytics/departments'),
  monthlyTrend:   () => API.get('/analytics/monthly-trend'),
  resolutionTime: () => API.get('/analytics/resolution-time'),
  statusSummary:  () => API.get('/analytics/status-summary'),
  topEmployees:   () => API.get('/analytics/top-employees'),
  categoryGroups: () => API.get('/analytics/category-groups'),
  etlStatus:      () => API.get('/analytics/etl-status'),
};

export default API;
