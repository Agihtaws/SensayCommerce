import api from './api';
import toast from 'react-hot-toast';

class ChatService {
  async sendAuthenticatedMessage(message, conversationId = 'default') {
    try {
      const response = await api.post('/chat/authenticated', { message, conversationId });
      if (response.data.success) {
        console.log('✅ Authenticated chat message sent:', message);
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to send authenticated chat message:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to send message');
    }
  }

  async sendAnonymousMessage(message) {
    try {
      const response = await api.post('/chat/anonymous', { message });
      if (response.data.success) {
        console.log('✅ Anonymous chat message sent:', message);
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to send anonymous chat message:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to send message');
    }
  }

  async getChatHistory(conversationId = 'default', limit = 50) {
    try {
      const response = await api.get(`/chat/history?conversationId=${conversationId}&limit=${limit}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to fetch chat history:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch chat history');
    }
  }

  async getDashboardData() {
    try {
      const response = await api.get('/chat/dashboard');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch dashboard data');
    }
  }
}

export default new ChatService();
