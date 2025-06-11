/**
 * Cliente de API para comunicação com o backend
 */
import axios from 'axios';

// Obter a URL da API do ambiente
const API_URL = import.meta.env.VITE_API_URL || 'https://primefit-production-e300.up.railway.app';
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'wss://primefit-production-e300.up.railway.app/ws';

// Criar instância do axios com configurações padrão
const apiClient = axios.create({
  baseURL: API_URL,
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
  async (error) => {
    // Se o erro for 401 (não autorizado), limpar o token e redirecionar para login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API de autenticação
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('auth/token', {
        email: email,
        senha: password,
      });
      
      // Salvar token e dados do usuário
      localStorage.setItem('auth_token', response.data.access_token);
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao fazer login' };
    }
  },
  
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao registrar' };
    }
  },
  
  logout: async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    return { error: null };
  },
  
  resetPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { email });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao resetar senha' };
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/profiles/me');
      localStorage.setItem('user_data', JSON.stringify(response.data));
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter usuário' };
    }
  },

  uploadDocs: async (formData) => {
    try {
      const response = await apiClient.post('/auth/upload_docs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao fazer upload de documentos:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao fazer upload de documentos' };
    }
  },
};

// API de perfis
export const profilesAPI = {
  getMyProfile: async () => {
    try {
      const response = await apiClient.get('/profiles/me');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter perfil' };
    }
  },
  
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/profiles/me', profileData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao atualizar perfil' };
    }
  },
  
  getProfileById: async (userId) => {
    try {
      const response = await apiClient.get(`/profiles/${userId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter perfil por ID:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter perfil' };
    }
  },
  
  getAllProfiles: async (skip = 0, limit = 100) => {
    try {
      const response = await apiClient.get(`/profiles?skip=${skip}&limit=${limit}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter todos os perfis:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter perfis' };
    }
  },
};

// API de mensagens
export const messagesAPI = {
  getMyMessages: async () => {
    try {
      const response = await apiClient.get('/messages');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter mensagens:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter mensagens' };
    }
  },
  
  getConversation: async (otherUserId) => {
    try {
      const response = await apiClient.get(`/messages/conversation/${otherUserId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter conversa:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter conversa' };
    }
  },
  
  sendMessage: async (receiverId, content) => {
    try {
      const response = await apiClient.post('/messages', { receiver_id: receiverId, content });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao enviar mensagem' };
    }
  },
  
  markAsRead: async (messageId) => {
    try {
      const response = await apiClient.put(`/messages/read/${messageId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao marcar mensagem' };
    }
  },
  
  connectWebSocket: (userId, tokenParam = null) => {
  const token = tokenParam || localStorage.getItem('auth_token');
  const ws = new WebSocket(`wss://primefit-production-e300.up.railway.app/ws/messages/ws/${user?.id}?token=${token}`);


  ws.onopen = () => {
    console.log('WebSocket conectado');
    // Enviar ping a cada 30 segundos para manter a conexão
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
},
};

// API de treinos
export const trainingsAPI = {
  getMyTrainings: async () => {
    try {
      const response = await apiClient.get('/trainings');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter treinos:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter treinos' };
    }
  },
  
  getTrainingById: async (trainingId) => {
    try {
      const response = await apiClient.get(`/trainings/${trainingId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter treino por ID:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter treino' };
    }
  },
  
  createTraining: async (trainingData) => {
    try {
      const response = await apiClient.post('/trainings', trainingData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao criar treino:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao criar treino' };
    }
  },
  
  updateTraining: async (trainingId, trainingData) => {
    try {
      const response = await apiClient.put(`/trainings/${trainingId}`, trainingData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar treino:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao atualizar treino' };
    }
  },
  
  deleteTraining: async (trainingId) => {
    try {
      const response = await apiClient.delete(`/trainings/${trainingId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao excluir treino:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao excluir treino' };
    }
  },

  getSentTrainings: async (clientEmail) => {
    try {
      const response = await apiClient.get(`/api/treinos-enviados?cliente_email=${encodeURIComponent(clientEmail)}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter treinos enviados:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter treinos enviados' };
    }
  },
};

// API de avaliações
export const assessmentsAPI = {
  getMyAssessments: async () => {
    try {
      const response = await apiClient.get('/assessments');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter avaliações:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter avaliações' };
    }
  },
  
  getAssessmentById: async (assessmentId) => {
    try {
      const response = await apiClient.get(`/assessments/${assessmentId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter avaliação por ID:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter avaliação' };
    }
  },
  
  createAssessment: async (assessmentData) => {
    try {
      const response = await apiClient.post('/assessments', assessmentData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao criar avaliação' };
    }
  },
};

// API de progresso
export const progressAPI = {
  getMyProgress: async () => {
    try {
      const response = await apiClient.get('/progress');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter progresso:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter progresso' };
    }
  },
  
  addProgressEntry: async (progressData) => {
    try {
      const response = await apiClient.post('/progress', progressData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao adicionar entrada de progresso:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao adicionar progresso' };
    }
  },
};

// API de admin
export const adminAPI = {
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter estatísticas do dashboard:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter estatísticas' };
    }
  },
  
  getAllUsers: async (skip = 0, limit = 100) => {
    try {
      const response = await apiClient.get(`/admin/users?skip=${skip}&limit=${limit}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter todos os usuários:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter usuários' };
    }
  },
  
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/admin/users/${userId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter usuário por ID:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter usuário' };
    }
  },
  
  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/admin/users/${userId}`, userData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao atualizar usuário' };
    }
  },
  
  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao excluir usuário' };
    }
  },

  getHistorico: async (clientEmail) => {
    try {
      const response = await apiClient.get(`/admin/historico/${encodeURIComponent(clientEmail)}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter histórico' };
    }
  },

  getEventos: async (clientEmail) => {
    try {
      const response = await apiClient.get(`/admin/eventos/${encodeURIComponent(clientEmail)}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao obter eventos:', error);
      return { data: null, error: error.response?.data?.detail || 'Erro ao obter eventos' };
    }
  },
};

// Exportar o cliente de API
export default apiClient;


