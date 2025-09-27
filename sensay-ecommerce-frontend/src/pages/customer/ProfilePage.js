import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Loading from '../../components/common/Loading';
import { User, Mail, Phone, MapPin, Save, Edit, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast'; // Correct import
import '../../styles/ProfilePage.css'; // Import the custom CSS

const ProfilePage = () => {
  const { user, isAuthenticated, isCustomer, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated || !isCustomer()) {
      toast.error('Please login as a customer to view your profile.');
      navigate('/login');
      return;
    }
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || '',
        },
      });
      setLoading(false);
    }
  }, [user, isAuthenticated, isCustomer, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' })); // Clear error on change
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    // Add more validation as needed for address fields
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the form errors.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.put(`/auth/me`, formData); // Assuming a PUT /auth/me endpoint exists in backend
      if (response.data.success) {
        await updateUser(); // Refresh user data in context
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile.');
      console.error('Profile update error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to current user data
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || '',
      },
    });
    setErrors({});
  };

  if (loading) {
    return <Loading text="Loading your profile..." />;
  }

  if (!user) {
    return (
      <div className="profile-not-found-container">
        <AlertCircle className="profile-not-found-icon" />
        <h3 className="profile-not-found-title">User not found</h3>
        <p className="profile-not-found-message">
          Please login to view your profile.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="btn btn-primary btn-lg"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <div className="profile-page-header">
        <h1 className="profile-page-title">My Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-primary"
          >
            <Edit className="btn-icon" />
            Edit Profile
          </button>
        ) : (
          <div className="profile-page-actions">
            <button
              onClick={handleCancelEdit}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="profile-form"
              disabled={submitting}
              className="btn btn-success"
            >
              {submitting ? (
                <div className="loading-spinner loading-small"></div>
              ) : (
                <>
                  <Save className="btn-icon" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <form id="profile-form" onSubmit={handleSubmit} className="profile-form-content">
        {/* Personal Information */}
        <div className="profile-section">
          <h2 className="profile-section-title">Personal Information</h2>
          <div className="profile-grid-2">
            <div>
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input 
                type="text" 
                name="firstName" 
                id="firstName" 
                value={formData.firstName} 
                onChange={handleChange} 
                disabled={!isEditing} 
                className={`form-input ${errors.firstName ? 'error' : ''} ${!isEditing ? 'disabled' : ''}`} 
              />
              {errors.firstName && <p className="form-error">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input 
                type="text" 
                name="lastName" 
                id="lastName" 
                value={formData.lastName} 
                onChange={handleChange} 
                disabled={!isEditing} 
                className={`form-input ${errors.lastName ? 'error' : ''} ${!isEditing ? 'disabled' : ''}`} 
              />
              {errors.lastName && <p className="form-error">{errors.lastName}</p>}
            </div>
            <div>
              <label htmlFor="email" className="form-label">Email Address</label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                value={formData.email} 
                onChange={handleChange} 
                disabled={!isEditing} 
                className={`form-input ${errors.email ? 'error' : ''} ${!isEditing ? 'disabled' : ''}`} 
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                id="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                disabled={!isEditing} 
                className={`form-input ${!isEditing ? 'disabled' : ''}`} 
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="profile-section">
          <h2 className="profile-section-title">Address Information</h2>
          <div className="profile-grid-2">
            <div className="profile-full-width">
              <label htmlFor="address.street" className="form-label">Street Address</label>
              <input 
                type="text" 
                name="address.street" 
                id="address.street" 
                value={formData.address.street} 
                onChange={handleChange} 
                disabled={!isEditing} 
                className={`form-input ${!isEditing ? 'disabled' : ''}`} 
              />
            </div>
            <div>
              <label htmlFor="address.city" className="form-label">City</label>
              <input 
                type="text" 
                name="address.city" 
                id="address.city" 
                value={formData.address.city} 
                onChange={handleChange} 
                disabled={!isEditing} 
                className={`form-input ${!isEditing ? 'disabled' : ''}`} 
              />
            </div>
            <div>
              <label htmlFor="address.state" className="form-label">State / Province</label>
              <input 
                type="text" 
                name="address.state" 
                id="address.state" 
                value={formData.address.state} 
                onChange={handleChange} 
                disabled={!isEditing} 
                className={`form-input ${!isEditing ? 'disabled' : ''}`} 
              />
            </div>
            <div>
              <label htmlFor="address.zipCode" className="form-label">ZIP / Postal Code</label>
              <input 
                type="text" 
                name="address.zipCode" 
                id="address.zipCode" 
                value={formData.address.zipCode} 
                onChange={handleChange} 
                disabled={!isEditing} 
                className={`form-input ${!isEditing ? 'disabled' : ''}`} 
              />
            </div>
            <div>
              <label htmlFor="address.country" className="form-label">Country</label>
              <input 
                type="text" 
                name="address.country" 
                id="address.country" 
                value={formData.address.country} 
                onChange={handleChange} 
                disabled={!isEditing} 
                className={`form-input ${!isEditing ? 'disabled' : ''}`} 
              />
            </div>
          </div>
        </div>

        {/* Change Password (Placeholder) */}
        <div className="profile-section profile-password-section">
          <h2 className="profile-section-title">Change Password</h2>
          <p className="profile-password-note">
            For security reasons, password changes are handled separately. Please click the button below to change your password.
          </p>
          <button
            type="button"
            onClick={() => toast('Password change functionality to be implemented.', { icon: '🔑' })} // FIXED: Using toast() directly with icon option
            className="btn btn-secondary profile-password-btn"
          >
            <Lock className="btn-icon" />
            Change Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
