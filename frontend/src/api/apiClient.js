/**
 * Cliente de API para comunicação com o backend - VERSÃO CORRIGIDA
 */
import axios from 'axios';

// URLs da API e WebSocket (usando variáveis de ambiente ou valores padrão)
const API_URL = import.meta.env.VITE_API_URL || 'https://primefit-production-e300.up.railway.app';
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'wss://primefit-production-e300.up.railway.app/ws/messages/ws';

// Criar instância do axios com prefixo /api
const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
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

// Interceptor para tratar erros de resposta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// WebSocket
export const connectWebSocket = (userId, tokenParam = null) => {
  const token = tokenParam || localStorage.getItem('auth_token');
  const ws = new WebSocket(`${WEBSOCKET_URL}/${userId}?token=${token}`);

  ws.onopen = () => {
    console.log('WebSocket conectado');
    ws.pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  };

  ws.onclose = () => {
    console.warn('WebSocket desconectado');
    if (ws.pingInterval) {
      clearInterval(ws.pingInterval);
    }
  };

  return ws;
};

export { apiClient };
export default apiClient;
