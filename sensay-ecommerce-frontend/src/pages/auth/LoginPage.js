import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, LogIn, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname || (user.role === 'admin' ? '/admin/dashboard' : '/');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      // Redirect based on user role
      const redirectPath = result.user.role === 'admin' ? '/admin/dashboard' : '/';
      const from = location.state?.from?.pathname || redirectPath;
      navigate(from, { replace: true });
    } catch (error) {
      // Error is already handled in AuthContext with toast
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-simple">
      {/* Background Pattern */}
      <div className="login-bg-pattern"></div>
      
      {/* Main Container */}
      <div className="login-simple-container">
        {/* Header */}
        <div className="login-simple-header">
          <div className="login-simple-brand">
            <div className="login-brand-icon">
              <ShoppingBag className="login-brand-icon-svg" />
            </div>
            <h1 className="login-simple-brand-title">
              Sensay E-commerce
            </h1>
          </div>
          <p className="login-simple-subtitle">Professional E-commerce Platform</p>
        </div>

        {/* Login Form Card */}
        <div className="login-simple-card">
          <div className="login-simple-card-body">
            {/* Form Header */}
            <div className="login-simple-form-header">
              <h2 className="login-simple-form-title">
                Welcome back
              </h2>
              <p className="login-simple-form-subtitle">
                Sign in to your account to continue
              </p>
            </div>

            <form className="login-simple-form" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <div className="login-input-wrapper">
                  <div className="login-input-icon">
                    <Mail className="login-input-icon-svg" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input login-simple-input"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="login-input-wrapper">
                  <div className="login-input-icon">
                    <Lock className="login-input-icon-svg" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input login-simple-input login-input-password"
                    placeholder="Enter your password"
                  />
                  <div className="login-password-toggle">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="login-password-toggle-btn"
                    >
                      {showPassword ? (
                        <EyeOff className="login-password-toggle-icon" />
                      ) : (
                        <Eye className="login-password-toggle-icon" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="login-forgot-password">
                <Link
                  to="/forgot-password"
                  className="login-forgot-link"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="login-simple-submit-btn"
              >
                <div className="login-submit-overlay"></div>
                <div className="login-submit-content">
                  {isLoading ? (
                    <div className="loading-spinner loading-small"></div>
                  ) : (
                    <>
                      <LogIn className="login-submit-icon" />
                      Sign in to your account
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Register Link */}
            <div className="login-simple-register-section">
              <p className="login-register-text">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="login-register-link"
                >
                  Create one now
                </Link>
              </p>
            </div>

            {/* Divider */}
            <div className="login-divider">
              <div className="login-divider-line"></div>
              <div className="login-divider-text">
                <span className="login-divider-label">
                  Demo Accounts
                </span>
              </div>
            </div>

            {/* Test Accounts */}
            <div className="login-simple-demo-accounts">
              <div className="login-simple-demo-account login-demo-admin">
                <div className="login-simple-demo-content">
                  <div className="login-simple-demo-left">
                    <p className="login-demo-account-role">Administrator</p>
                    <p className="login-demo-account-email">
                      admin@sensay-ecommerce.com
                    </p>
                  </div>
                  <div className="login-simple-demo-right">
                    <p className="login-demo-account-password">
                      Admin123!
                    </p>
                    <div className="login-demo-account-badge login-demo-badge-admin">Full Access</div>
                  </div>
                </div>
              </div>
          
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="login-simple-footer">
          <p className="login-footer-text">
            © 2025 Sensay E-commerce. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
