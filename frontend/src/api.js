/**
 * api.js
 * Instância configurada do axios com:
 *  - Adição automática do Bearer token em todos os requests
 *  - Redirecionamento para /login em caso de 401
 */
import axios from 'axios';
import ROUTES from './routes';

const api = axios.create({
  baseURL: ROUTES.base(),
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: adiciona o token ─────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: trata 401 ──────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Tenta renovar o token automaticamente uma única vez
    if (
      error.response?.status === 401 &&
      !original._retry &&
      localStorage.getItem('refresh_token')
    ) {
      original._retry = true;
      try {
        const { data } = await axios.post(ROUTES.tokenRefresh(), {
          refresh: localStorage.getItem('refresh_token'),
        });
        localStorage.setItem('access_token', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        // Refresh falhou — redireciona para login
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
