import axios from 'axios';
import { getAdminToken } from './adminAuth';

const isBrowser = typeof window !== 'undefined';
const isProd = import.meta.env.PROD;

const normalizeBaseUrl = (value) => {
  if (!value) return '';
  return value.replace(/\/+$/, '');
};

const resolveBaseUrl = () => {
  const envBase = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
  if (envBase) return envBase;

  if (!isProd) return 'http://localhost:5000/api';

  if (isBrowser) {
    // Last-resort fallback for same-origin deployments where API is reverse-proxied at /api.
    return `${window.location.origin}/api`;
  }

  return '/api';
};

export const getApiErrorMessage = (error, fallback = 'Request failed') => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.statusText) return `${error.response.status} ${error.response.statusText}`;

  // axios network errors happen when backend is down, blocked by CORS, DNS fails, etc.
  if (error?.code === 'ERR_NETWORK') {
    return 'Unable to reach backend API. Check VITE_API_BASE_URL and backend CORS/health.';
  }

  return error?.message || fallback;
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage = getApiErrorMessage(error);
    return Promise.reject(error);
  },
);

export default api;
