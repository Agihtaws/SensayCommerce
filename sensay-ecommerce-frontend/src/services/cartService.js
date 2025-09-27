import api from './api';
import toast from 'react-hot-toast';

class CartService {
  async getCart() {
    try {
      const response = await api.get('/cart');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to fetch cart:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch cart');
    }
  }

  async addItem(productId, quantity = 1) {
    try {
      const response = await api.post('/cart/add', { productId, quantity });
      if (response.data.success) {
        console.log('✅ Item added to cart:', productId);
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to add item to cart:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to add item to cart');
    }
  }

  async updateItemQuantity(productId, quantity) {
    try {
      const response = await api.put(`/cart/update/${productId}`, { quantity });
      if (response.data.success) {
        console.log('✅ Cart item quantity updated:', productId);
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to update cart item quantity:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to update cart item quantity');
    }
  }

  async removeItem(productId) {
    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      if (response.data.success) {
        console.log('✅ Item removed from cart:', productId);
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to remove item from cart:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to remove item from cart');
    }
  }

  async clearCart() {
    try {
      const response = await api.delete('/cart/clear');
      if (response.data.success) {
        console.log('✅ Cart cleared');
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to clear cart:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to clear cart');
    }
  }
}

export default new CartService();
