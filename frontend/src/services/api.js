import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
});

export const ticketAPI = {
  getAll:    (params) => API.get('/tickets/', { params }),
  getOne:    (id)     => API.get(`/tickets/${id}`),
  create:    (data)   => API.post('/tickets/', data),
  update:    (id, data) => API.put(`/tickets/${id}`, data),
  delete:    (id)     => API.delete(`/tickets/${id}`),
  search:    (q)      => API.get('/search', { params: { q } }),
  dashboard: ()       => API.get('/dashboard'),
  count:     (params) => API.get('/tickets/count', { params }),
};

export const metaAPI = {
  categories:  () => API.get('/meta/categories'),
  priorities:  () => API.get('/meta/priorities'),
  statuses:    () => API.get('/meta/statuses'),
  departments: () => API.get('/meta/departments'),
};

export default API;
