// http.js – cliente base con Axios, mismo contrato que versión fetch
import axios from 'axios';
import { redirectToLogin } from '@/hooks/useAuth';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
  timeout: 20000,
});

instance.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      redirectToLogin();
      return Promise.reject(new Error('Sesión expirada. Inicia sesión nuevamente.'));
    }
    const msg = error?.response?.data?.error || error.message || `HTTP ${status || 'ERR'}`;
    return Promise.reject(new Error(msg));
  }
);

export async function http(path, { method = 'GET', body, token } = {}) {
  const config = { url: path, method };

  if (token) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }

  if (body instanceof FormData) {
    config.data = body;
    const headers = config.headers || {};
    delete headers['Content-Type'];
    config.headers = headers;
  } else if (body) {
    config.data = body;
  }

  const res = await instance.request(config);
  return res.data;
}
