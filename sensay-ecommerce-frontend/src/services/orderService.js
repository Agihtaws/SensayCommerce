import api from './api';

class OrderService {
  async createOrder(orderData) {
    try {
      const response = await api.post('/orders/create', orderData);
      if (response.data.success) {
        console.log('✅ Order created:', response.data.data.orderNumber);
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to create order:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to create order');
    }
  }

  async getOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/orders?${queryParams.toString()}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch orders');
    }
  }

  async getOrder(orderNumber) {
    try {
      const response = await api.get(`/orders/${orderNumber}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to fetch order details:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Order not found');
    }
  }

  // --- ADMIN ORDER METHODS (NEW) ---

  async getAdminOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);

      const response = await api.get(`/orders/admin/all?${queryParams.toString()}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to fetch admin orders:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch admin orders');
    }
  }

  async getAdminOrderDetails(orderNumber) {
    try {
      const response = await api.get(`/orders/admin/${orderNumber}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to fetch admin order details:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Admin order not found');
    }
  }

  async updateOrderStatus(orderNumber, newStatus) {
    try {
      const response = await api.patch(`/orders/admin/${orderNumber}/status`, { orderStatus: newStatus });
      if (response.data.success) {
        console.log(`✅ Order ${orderNumber} status updated to ${newStatus}`);
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to update order status:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to update order status');
    }
  }
}

export default new OrderService();
