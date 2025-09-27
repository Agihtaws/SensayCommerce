import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ShoppingBag, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...registrationData } = formData;
      
      const result = await register(registrationData);
      
      // Redirect based on user role
      const redirectPath = result.user.role === 'admin' ? '/admin/dashboard' : '/';
      navigate(redirectPath, { replace: true });
    } catch (error) {
      // Error is already handled in AuthContext with toast
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Background Pattern */}
      <div className="register-bg-pattern"></div>
      
      <div className="register-container">
        {/* Header */}
        <div className="register-header">
          <div className="register-brand-icon-wrapper">
            <div className="register-brand-icon">
              <ShoppingBag className="register-brand-icon-svg" />
            </div>
          </div>
          <h1 className="register-title">
            Join Sensay E-commerce
          </h1>
          <p className="register-subtitle">
            Create your account to start your e-commerce journey
          </p>
          <p className="register-login-link">
            Already have an account?{' '}
            <Link
              to="/login"
              className="register-login-link-text"
            >
              Sign in here
            </Link>
          </p>
        </div>

        <div className="register-card">
          <div className="register-card-body">
            <form className="register-form" onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div className="register-section">
                <h3 className="register-section-title">
                  <User className="register-section-icon" />
                  Personal Information
                </h3>
                
                <div className="register-grid-2">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="form-input register-input"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="form-input register-input"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="register-section">
                <h3 className="register-section-title">
                  <Mail className="register-section-icon" />
                  Contact Information
                </h3>
                
                <div className="register-form-group">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <div className="register-input-wrapper">
                      <div className="register-input-icon">
                        <Mail className="register-input-icon-svg" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input register-input register-input-with-icon"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Phone Number *
                    </label>
                    <div className="register-input-wrapper">
                      <div className="register-input-icon">
                        <Phone className="register-input-icon-svg" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-input register-input register-input-with-icon"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="register-section">
                <h3 className="register-section-title">
                  <MapPin className="register-section-icon" />
                  Address Information
                </h3>
                
                <div className="register-form-group">
                  <div className="form-group">
                    <label htmlFor="address.street" className="form-label">
                      Street Address
                    </label>
                    <input
                      id="address.street"
                      name="address.street"
                      type="text"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="form-input register-input"
                      placeholder="Enter your street address"
                    />
                  </div>

                  <div className="register-grid-3">
                    <div className="form-group">
                      <label htmlFor="address.city" className="form-label">
                        City
                      </label>
                      <input
                        id="address.city"
                        name="address.city"
                        type="text"
                        value={formData.address.city}
                        onChange={handleChange}
                        className="form-input register-input"
                        placeholder="City"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address.state" className="form-label">
                        State
                      </label>
                      <input
                        id="address.state"
                        name="address.state"
                        type="text"
                        value={formData.address.state}
                        onChange={handleChange}
                        className="form-input register-input"
                        placeholder="State"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address.zipCode" className="form-label">
                        ZIP Code
                      </label>
                      <input
                        id="address.zipCode"
                        name="address.zipCode"
                        type="text"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        className="form-input register-input"
                        placeholder="ZIP Code"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Information */}
              <div className="register-section">
                <h3 className="register-section-title">
                  <Lock className="register-section-icon" />
                  Security Information
                </h3>
                
                <div className="register-grid-2">
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      Password *
                    </label>
                    <div className="register-input-wrapper">
                      <div className="register-input-icon">
                        <Lock className="register-input-icon-svg" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="form-input register-input register-input-with-icon register-input-password"
                        placeholder="Create a password"
                      />
                      <div className="register-password-toggle">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="register-password-toggle-btn"
                        >
                          {showPassword ? (
                            <EyeOff className="register-password-toggle-icon" />
                          ) : (
                            <Eye className="register-password-toggle-icon" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password *
                    </label>
                    <div className="register-input-wrapper">
                      <div className="register-input-icon">
                        <Lock className="register-input-icon-svg" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="form-input register-input register-input-with-icon register-input-password"
                        placeholder="Confirm your password"
                      />
                      <div className="register-password-toggle">
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="register-password-toggle-btn"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="register-password-toggle-icon" />
                          ) : (
                            <Eye className="register-password-toggle-icon" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="register-password-hint">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Submit Button */}
              <div className="register-submit-section">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="register-submit-btn"
                >
                  <div className="register-submit-overlay"></div>
                  <div className="register-submit-content">
                    {isLoading ? (
                      <div className="loading-spinner loading-small"></div>
                    ) : (
                      <>
                        <UserPlus className="register-submit-icon" />
                        Create Account
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="register-terms">
              <p className="register-terms-text">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="register-footer">
          <p className="register-footer-text">
            © 2025 Sensay E-commerce. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
