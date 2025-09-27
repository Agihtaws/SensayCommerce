import api from './api';
import Cookies from 'js-cookie';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',
};

class AuthService {
  // Customer login
  async login(email, password) {
    try {
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
        email,
        password,
      });

      if (response.data.success) {
        const { token, user, sensayBalance } = response.data.data;
        
        // Store auth data in cookies
        Cookies.set('authToken', token, { expires: 7 }); // 7 days
        Cookies.set('userRole', user.role, { expires: 7 });
        Cookies.set('userData', JSON.stringify(user), { expires: 7 });
        
        if (sensayBalance !== null) {
          Cookies.set('sensayBalance', sensayBalance.toString(), { expires: 7 });
        }

        console.log('✅ Login successful:', user.email);
        return { success: true, user, token, sensayBalance };
      }
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  // Customer registration
  async register(userData) {
    try {
      const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);

      if (response.data.success) {
        const { token, user, sensayBalance } = response.data.data;
        
        // Store auth data in cookies
        Cookies.set('authToken', token, { expires: 7 });
        Cookies.set('userRole', user.role, { expires: 7 });
        Cookies.set('userData', JSON.stringify(user), { expires: 7 });
        Cookies.set('sensayBalance', sensayBalance.toString(), { expires: 7 });

        console.log('✅ Registration successful:', user.email);
        return { success: true, user, token, sensayBalance };
      }
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get(AUTH_ENDPOINTS.ME);
      
      if (response.data.success) {
        const { user, sensayBalance } = response.data.data;
        
        // Update stored user data
        Cookies.set('userData', JSON.stringify(user), { expires: 7 });
        if (sensayBalance !== null) {
          Cookies.set('sensayBalance', sensayBalance.toString(), { expires: 7 });
        }

        return { success: true, user, sensayBalance };
      }
    } catch (error) {
      console.error('❌ Get current user failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Update current user profile (NEW)
  async updateProfile(userData) {
    try {
      const response = await api.put(AUTH_ENDPOINTS.ME, userData);
      if (response.data.success) {
        const { user } = response.data.data;
        Cookies.set('userData', JSON.stringify(user), { expires: 7 });
        console.log('✅ User profile updated:', user.email);
        return { success: true, user };
      }
    } catch (error) {
      console.error('❌ Failed to update profile:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to update profile');
    }
  }


  // Logout
  logout() {
    Cookies.remove('authToken');
    Cookies.remove('userRole');
    Cookies.remove('userData');
    Cookies.remove('sensayBalance');
    console.log('✅ Logout successful');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!Cookies.get('authToken');
  }

  // Get user role
  getUserRole() {
    return Cookies.get('userRole');
  }

  // Get user data
  getUserData() {
    const userData = Cookies.get('userData');
    return userData ? JSON.parse(userData) : null;
  }

  // Get Sensay balance
  getSensayBalance() {
    const balance = Cookies.get('sensayBalance');
    return balance ? parseFloat(balance) : 0;
  }

  // Check if user is admin
  isAdmin() {
    return this.getUserRole() === 'admin';
  }

  // Check if user is customer
  isCustomer() {
    return this.getUserRole() === 'customer';
  }
}

export default new AuthService();
