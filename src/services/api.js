import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';
const KEEP_ALIVE_INTERVAL = 60000;

let keepAliveTimer = null;
let isKeepingAlive = false;

export const api = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

export const startKeepAlive = () => {
  if (isKeepingAlive) return;
  
  isKeepingAlive = true;
  
  const ping = async () => {
    try {
      await api.get('/ping');
      console.log('[KeepAlive] Ping sent');
    } catch (error) {
      console.log('[KeepAlive] Ping failed:', error.message);
    }
  };

  ping();
  keepAliveTimer = setInterval(ping, KEEP_ALIVE_INTERVAL);
};

export const stopKeepAlive = () => {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
    isKeepingAlive = false;
  }
};

export default api;
