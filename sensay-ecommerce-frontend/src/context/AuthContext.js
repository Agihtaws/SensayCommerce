import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        sensayBalance: action.payload.sensayBalance,
        loading: false,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        sensayBalance: 0,
        loading: false,
      };
    
    case 'UPDATE_USER': // This action now correctly updates user data and sensayBalance
      return {
        ...state,
        user: action.payload.user,
        sensayBalance: action.payload.sensayBalance,
      };
    
    case 'UPDATE_BALANCE': // Kept for direct balance updates if needed, but updateUser is preferred
      return {
        ...state,
        sensayBalance: action.payload,
      };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  sensayBalance: 0,
  loading: true,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from cookies
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        if (authService.isAuthenticated()) {
          // Fetch current user data from backend to ensure latest balance and user info
          const result = await authService.getCurrentUser();
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: result.user,
              token: true, // We know token exists from isAuthenticated()
              sensayBalance: result.sensayBalance,
            },
          });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        authService.logout();
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await authService.login(email, password);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: result,
      });
      
      toast.success(`Welcome back, ${result.user.firstName}!`);
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await authService.register(userData);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: result,
      });
      
      toast.success(`Welcome to Sensay E-commerce, ${result.user.firstName}!`);
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  // Update user data (fetches latest from backend)
  const updateUser = async () => {
    try {
      const result = await authService.getCurrentUser();
      dispatch({
        type: 'UPDATE_USER',
        payload: result,
      });
      return result;
    } catch (error) {
      console.error('Failed to update user:', error);
      // If updating user fails due to token, auto-logout
      if (error.response?.status === 401) {
        logout();
      }
      throw error; // Re-throw to allow component to handle
    }
  };

  // Update Sensay balance (can be called directly if needed, but updateUser is preferred)
  const updateBalance = (newBalance) => {
    dispatch({ type: 'UPDATE_BALANCE', payload: newBalance });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    updateBalance,
    isAdmin: () => state.user?.role === 'admin',
    isCustomer: () => state.user?.role === 'customer',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
