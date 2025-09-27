import api from './api';

class AdminCustomerService {
  async getAllCustomers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/auth/admin/customers/all?${queryParams.toString()}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to fetch all customers:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch customers');
    }
  }

  async getCustomerDetails(customerId) {
    try {
      const response = await api.get(`/auth/admin/customers/${customerId}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to fetch customer details:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch customer details');
    }
  }


  async updateCustomerSensayBalance(customerId, amount, transactionType, description) {
    try {
      const response = await api.patch(`/auth/admin/customers/${customerId}/balance`, {
        amount,
        transactionType,
        description,
      });
      if (response.data.success) {
        console.log('✅ Customer Sensay balance updated:', customerId);
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to update customer Sensay balance:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to update customer Sensay balance');
    }
  }
}

export default new AdminCustomerService();
