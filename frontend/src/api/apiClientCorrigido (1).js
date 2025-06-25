
/**
 * Cliente de API para comunicação com o backend
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/ws';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
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
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/login', {
        email,
        senha: password,
      });
      localStorage.setItem('auth_token', response.data.access_token);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao fazer login' };
    }
  },
  // ... (restante igual, mantido sem alterações)
};

export default apiClient;
