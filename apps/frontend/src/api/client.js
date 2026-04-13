import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  magicLink: (email) => client.post('/auth/magic-link', { email }),
  verify: (token) => client.get(`/auth/verify/${token}`),
  me: () => client.get('/auth/me'),
  invite: (email, familyId) => client.post('/auth/invite', { email, family_id: familyId }),
};

export const personsAPI = {
  list: () => client.get('/persons'),
  get: (id) => client.get(`/persons/${id}`),
  create: (data) => client.post('/persons', data),
  update: (id, data) => client.patch(`/persons/${id}`, data),
  approve: (id) => client.patch(`/persons/${id}/approve`),
  delete: (id) => client.delete(`/persons/${id}`),
};

export const familiesAPI = {
  list: () => client.get('/families'),
  get: (id) => client.get(`/families/${id}`),
  create: (data) => client.post('/families', data),
  update: (id, data) => client.patch(`/families/${id}`, data),
};

export const relationshipsAPI = {
  list: () => client.get('/relationships'),
  create: (data) => client.post('/relationships', data),
  approve: (id) => client.patch(`/relationships/${id}/approve`),
  delete: (id) => client.delete(`/relationships/${id}`),
};

export const photosAPI = {
  list: (personId) => client.get(`/persons/${personId}/photos`),
  upload: (personId, formData) =>
    client.post(`/persons/${personId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  approve: (photoId) => client.patch(`/person_photos/${photoId}/approve`),
  delete: (photoId) => client.delete(`/person_photos/${photoId}`),
};

export const adminAPI = {
  getStats: () => client.get('/admin/stats'),
  getPending: () => client.get('/admin/pending'),
  getUsers: () => client.get('/admin/users'),
  changeRole: (userId, role) => client.patch(`/admin/users/${userId}/role`, { role }),
  revokeUser: (userId) => client.delete(`/admin/users/${userId}`),
};

export default client;
