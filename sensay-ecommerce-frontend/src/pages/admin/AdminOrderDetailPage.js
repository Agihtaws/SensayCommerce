import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import Loading from '../../components/common/Loading';
import {
  Package,
  Calendar,
  Truck,
  MapPin,
  CreditCard,
  Clipboard,
  AlertCircle,
  ArrowLeft,
  User,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/AdminOrderDetailPage.css';

const AdminOrderDetailPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newOrderStatus, setNewOrderStatus] = useState('');

  const orderStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAdminOrderDetails(orderNumber);
      setOrder(data);
      setNewOrderStatus(data.orderStatus); // Set initial status for dropdown
    } catch (error) {
      toast.error(error.message);
      console.error('Failed to fetch admin order details:', error);
      navigate('/admin/orders'); // Redirect to order list if not found
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!window.confirm(`Are you sure you want to change order ${orderNumber} status to ${newOrderStatus.toUpperCase()}?`)) {
      return;
    }
    setUpdatingStatus(true);
    try {
      await orderService.updateOrderStatus(orderNumber, newOrderStatus);
      await fetchOrderDetails(); // Re-fetch to update UI
      toast.success(`Order ${orderNumber} status updated to ${newOrderStatus.toUpperCase()}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="order-status-icon order-status-pending" />;
      case 'confirmed': return <CheckCircle className="order-status-icon order-status-confirmed" />;
      case 'processing': return <Activity className="order-status-icon order-status-processing" />;
      case 'shipped': return <Truck className="order-status-icon order-status-shipped" />;
      case 'delivered': return <CheckCircle className="order-status-icon order-status-delivered" />;
      case 'cancelled': return <XCircle className="order-status-icon order-status-cancelled" />;
      default: return <AlertCircle className="order-status-icon order-status-default" />;
    }
  };

  if (loading) {
    return <Loading text="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="order-detail-not-found">
        <AlertCircle className="order-not-found-icon" />
        <h3 className="order-not-found-title">Order not found</h3>
        <p className="order-not-found-text">
          The order you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="btn btn-primary btn-lg"
        >
          <ArrowLeft className="btn-icon" />
          Back to All Orders
        </button>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="order-detail-header">
        <h1 className="order-detail-title">Order #{order.orderNumber}</h1>
        <button
          onClick={() => navigate('/admin/orders')}
          className="btn btn-secondary"
        >
          <ArrowLeft className="btn-icon" />
          Back to Orders
        </button>
      </div>

      <div className="order-detail-grid">
        {/* Order Details */}
        <div className="order-detail-main">
          <div className="order-summary-card">
            <h2 className="card-title">Order Summary</h2>
            <div className="order-summary-content">
              <div className="order-summary-row">
                <span className="order-summary-label">Order Status:</span>
                <div className="order-status-controls">
                  <div className="order-status-display">
                    {getStatusIcon(order.orderStatus)}
                    <span className={`badge ${
                      order.orderStatus === 'delivered' ? 'badge-success' :
                      ['pending', 'confirmed', 'processing', 'shipped'].includes(order.orderStatus) ? 'badge-warning' :
                      'badge-danger'
                    }`}>
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                  </div>
                  <select
                    value={newOrderStatus}
                    onChange={(e) => setNewOrderStatus(e.target.value)}
                    disabled={updatingStatus}
                    className="form-select order-status-select"
                  >
                    {orderStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updatingStatus || newOrderStatus === order.orderStatus}
                    className="btn btn-primary btn-sm"
                  >
                    {updatingStatus ? <RefreshCw className="spinner" /> : 'Update'}
                  </button>
                </div>
              </div>
              <div className="order-summary-row">
                <span className="order-summary-label">Order Date:</span>
                <span className="order-summary-value">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="order-summary-row">
                <span className="order-summary-label">Total Amount:</span>
                <span className="order-total-amount">USD {order.total.toFixed(2)}</span>
              </div>
              {order.estimatedDelivery && (
                <div className="order-summary-row">
                  <span className="order-summary-label order-summary-with-icon">
                    <Truck className="order-summary-icon" />
                    Estimated Delivery:
                  </span>
                  <span className="order-summary-value">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                </div>
              )}
              {order.trackingNumber && (
                <div className="order-summary-row">
                  <span className="order-summary-label order-summary-with-icon">
                    <Clipboard className="order-summary-icon" />
                    Tracking Number:
                  </span>
                  <span className="order-tracking-number">{order.trackingNumber}</span>
                </div>
              )}
            </div>

            <div className="order-items-section">
              <h3 className="order-items-title">Items Ordered</h3>
              <div className="order-items-list">
                <ul className="order-items-ul">
                  {order.items.map((item) => (
                    <li key={item.productId} className="order-item">
                      <div className="order-item-image">
                        <img
                          src={item.productSnapshot.image || 'https://via.placeholder.com/150?text=No+Image'}
                          alt={item.productSnapshot.name}
                          className="order-item-img"
                        />
                      </div>

                      <div className="order-item-details">
                        <div>
                          <div className="order-item-header">
                            <h3>
                              <Link to={`/products/${item.productId}`} className="order-item-link">
                                {item.productSnapshot.name}
                              </Link>
                            </h3>
                            <p className="order-item-total">USD {item.total.toFixed(2)}</p>
                          </div>
                          <p className="order-item-quantity">Qty: {item.quantity} @ USD {item.price.toFixed(2)} each</p>
                        </div>
                        <div className="order-item-footer">
                          <p className="order-item-brand">{item.productSnapshot.brand}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Customer, Shipping & Payment Info */}
        <div className="order-detail-sidebar">
          <div className="order-info-card">
            <h2 className="card-title order-info-title">
              <User className="card-title-icon" />
              Customer Details
            </h2>
            <p className="order-info-item">
              Name: <span className="order-info-value">{order.userId?.firstName} {order.userId?.lastName}</span>
            </p>
            <p className="order-info-item">
              Email: <span className="order-info-value">{order.userId?.email}</span>
            </p>
          </div>

          <div className="order-info-card">
            <h2 className="card-title order-info-title">
              <MapPin className="card-title-icon" />
              Shipping Address
            </h2>
            <address className="order-shipping-address">
              <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </address>
          </div>

          <div className="order-info-card">
            <h2 className="card-title order-info-title">
              <CreditCard className="card-title-icon" />
              Payment Info
            </h2>
            <p className="order-info-item">
              Method: <span className="order-info-value">{order.paymentMethod.replace(/_/g, ' ').toUpperCase()}</span>
            </p>
            <p className="order-info-item">
              Status: <span className={`order-info-value ${
                order.paymentStatus === 'paid' ? 'order-payment-paid' : 'order-payment-unpaid'
              }`}>{order.paymentStatus.toUpperCase()}</span>
            </p>
          </div>

          {order.notes && (
            <div className="order-info-card">
              <h2 className="card-title">Order Notes</h2>
              <p className="order-notes">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
