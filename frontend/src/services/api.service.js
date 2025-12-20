import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Erros da API
      const { status, data } = error.response;
      let message = 'Erro na comunicação com o servidor';
      
      if (data?.error) {
        message = data.error;
      } else if (status === 404) {
        message = 'Endpoint não encontrado';
      } else if (status === 500) {
        message = 'Erro interno do servidor';
      }
      
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Sem resposta do servidor
      return Promise.reject(new Error('Servidor não respondendo. Verifique sua conexão.'));
    } else {
      // Erro na configuração da requisição
      return Promise.reject(new Error('Erro na configuração da requisição'));
    }
  }
);

export const viabilityService = {
  async checkViability(lat, lng, radius = 300) {
    return api.get('/api/viability', {
      params: { lat, lng, radius }
    });
  },

  async checkInfrastructure(lat, lng) {
    return api.get('/api/infraestrutura', {
      params: { lat, lng }
    });
  },

  async getStatistics() {
    return api.get('/api/estatisticas');
  },

  async checkHealth() {
    return api.get('/health');
  }
};

export default api;