import api from './api';
import toast from 'react-hot-toast';

class WishlistService {
  async getWishlist() {
    try {
      const response = await api.get('/wishlist');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to fetch wishlist:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch wishlist');
    }
  }

  async addItem(productId) {
    try {
      const response = await api.post('/wishlist/add', { productId });
      if (response.data.success) {
        console.log('✅ Item added to wishlist:', productId);
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to add item to wishlist:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to add item to wishlist');
    }
  }

  async removeItem(productId) {
    try {
      const response = await api.delete(`/wishlist/remove/${productId}`);
      if (response.data.success) {
        console.log('✅ Item removed from wishlist:', productId);
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to remove item from wishlist:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to remove item from wishlist');
    }
  }

  async clearWishlist() {
    try {
      const response = await api.delete('/wishlist/clear');
      if (response.data.success) {
        console.log('✅ Wishlist cleared');
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to clear wishlist:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to clear wishlist');
    }
  }
}

export default new WishlistService();
