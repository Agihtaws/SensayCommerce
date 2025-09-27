import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminCustomerService from '../../services/adminCustomerService';
import Loading from '../../components/common/Loading';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  AlertCircle,
  Coins,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/AdminCustomerDetailPage.css';

const AdminCustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceTransactionType, setBalanceTransactionType] = useState('adjustment');
  const [balanceDescription, setBalanceDescription] = useState('');
  const [updatingBalance, setUpdatingBalance] = useState(false);

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const data = await adminCustomerService.getCustomerDetails(id);
      setCustomerData(data);
    } catch (error) {
      toast.error(error.message);
      console.error('Failed to fetch customer details:', error);
      navigate('/admin/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceUpdate = async (e) => {
    e.preventDefault();
    if (!balanceAmount || isNaN(parseFloat(balanceAmount)) || parseFloat(balanceAmount) === 0) {
      toast.error('Please enter a valid non-zero amount for balance adjustment.');
      return;
    }
    if (!balanceTransactionType) {
      toast.error('Please select a transaction type.');
      return;
    }

    setUpdatingBalance(true);
    try {
      await adminCustomerService.updateCustomerSensayBalance(
        id,
        parseFloat(balanceAmount),
        balanceTransactionType,
        balanceDescription
      );
      toast.success('Sensay balance updated successfully!');
      setBalanceAmount('');
      setBalanceDescription('');
      fetchCustomerDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to update Sensay balance.');
      console.error('Sensay balance update error:', error);
    } finally {
      setUpdatingBalance(false);
    }
  };

  if (loading) {
    return <Loading text="Loading customer details..." />;
  }

  if (!customerData) {
    return (
      <div className="customer-detail-error-container">
        <AlertCircle size={96} className="customer-detail-error-icon" />
        <h3 className="customer-detail-error-title">Customer not found</h3>
        <p className="customer-detail-error-message">
          The customer you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate('/admin/customers')}
          className="btn btn-primary btn-lg"
        >
          <ArrowLeft size={20} />
          Back to Customer List
        </button>
      </div>
    );
  }

  const customer = customerData.customer;

  return (
    <div className="customer-detail-container">
      <div className="customer-detail-header">
        <h1 className="customer-detail-title">Customer: {customer.firstName} {customer.lastName}</h1>
        <button
          onClick={() => navigate('/admin/customers')}
          className="btn btn-secondary"
        >
          <ArrowLeft size={16} />
          Back to Customers
        </button>
      </div>

      <div className="customer-detail-card">
        {/* Personal Information (Read-Only) */}
        <div className="detail-section">
          <h2 className="detail-section-title">Personal Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <p className="detail-label">First Name</p>
              <p className="detail-value">{customer.firstName}</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Last Name</p>
              <p className="detail-value">{customer.lastName}</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Email Address</p>
              <p className="detail-value">{customer.email}</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Phone Number</p>
              <p className="detail-value">{customer.phone || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Address Information (Read-Only) */}
        <div className="detail-section">
          <h2 className="detail-section-title">Address Information</h2>
          <div className="detail-grid">
            <div className="detail-item full-width">
              <p className="detail-label">Street Address</p>
              <p className="detail-value">{customer.address?.street || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">City</p>
              <p className="detail-value">{customer.address?.city || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">State / Province</p>
              <p className="detail-value">{customer.address?.state || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">ZIP / Postal Code</p>
              <p className="detail-value">{customer.address?.zipCode || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Country</p>
              <p className="detail-value">{customer.address?.country || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Account Status (Read-Only) */}
        <div className="detail-section no-border-bottom">
          <h2 className="detail-section-title">Account Status</h2>
          <div className="account-status">
            <span className={`badge ${customer.isActive ? 'badge-success' : 'badge-danger'}`}>
              {customer.isActive ? 'Active' : 'Inactive'}
            </span>
            <p className="account-status-note">(Customer can log in)</p>
          </div>
        </div>
      </div>

      {/* Sensay Balance Management */}
      <div className="card balance-management-card">
        <h2 className="card-title">Sensay Balance Management</h2>
        <div className="current-balance">
          <Coins size={24} className="balance-icon" />
          <span className="balance-amount">
            Current Balance: {customerData.sensayBalance?.toLocaleString() || 0} units
          </span>
        </div>
        <form onSubmit={handleBalanceUpdate} className="balance-form">
          <div className="balance-form-grid">
            <div className="form-group">
              <label htmlFor="balanceAmount" className="form-label">Amount to Adjust</label>
              <div className="input-with-icon">
                <input
                  type="number"
                  name="balanceAmount"
                  id="balanceAmount"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="e.g., 100 or -50"
                  className="form-input"
                  step="1"
                />
                <div className="input-icon">
                  <Coins size={20} />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="balanceTransactionType" className="form-label">Transaction Type</label>
              <select
                name="balanceTransactionType"
                id="balanceTransactionType"
                value={balanceTransactionType}
                onChange={(e) => setBalanceTransactionType(e.target.value)}
                className="form-select"
              >
                <option value="adjustment">Adjustment</option>
                <option value="balance_refill">Refill</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="balanceDescription" className="form-label">Description (optional)</label>
            <textarea
              name="balanceDescription"
              id="balanceDescription"
              rows="2"
              value={balanceDescription}
              onChange={(e) => setBalanceDescription(e.target.value)}
              placeholder="Reason for balance adjustment"
              className="form-textarea"
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={updatingBalance || !balanceAmount || parseFloat(balanceAmount) === 0}
            className="btn btn-primary"
          >
            {updatingBalance ? (
              <div className="loading-spinner loading-small"></div>
            ) : (
              <>
                <Coins size={16} />
                Adjust Balance
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCustomerDetailPage;
