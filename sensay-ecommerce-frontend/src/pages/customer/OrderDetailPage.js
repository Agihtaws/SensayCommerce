import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/OrderDetailPage.css'; // Import the custom CSS

const OrderDetailPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isCustomer()) {
      toast.error('Please login as a customer to view order details.');
      navigate('/login');
      return;
    }
    fetchOrderDetails();
  }, [isAuthenticated, isCustomer, navigate, orderNumber]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrder(orderNumber);
      setOrder(data);
    } catch (error) {
      toast.error(error.message);
      console.error('Failed to fetch order details:', error);
      navigate('/orders'); // Redirect to order history if not found
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="order-detail-not-found-container">
        <AlertCircle className="order-not-found-icon" />
        <h3 className="order-not-found-title">Order not found</h3>
        <p className="order-not-found-message">
          The order you are looking for does not exist or you do not have access.
        </p>
        <button
          onClick={() => navigate('/orders')}
          className="btn btn-primary btn-lg"
        >
          <ArrowLeft className="btn-icon" />
          Back to Order History
        </button>
      </div>
    );
  }

  return (
    <div className="customer-order-detail-page">
      <div className="customer-order-detail-header">
        <h1 className="customer-order-detail-title">Order #{order.orderNumber}</h1>
        <button
          onClick={() => navigate('/orders')}
          className="btn btn-secondary"
        >
          <ArrowLeft className="btn-icon" />
          Back to History
        </button>
      </div>

      <div className="customer-order-detail-grid">
        {/* Order Details */}
        <div className="customer-order-detail-main">
          <div className="customer-order-summary-card">
            <h2 className="customer-order-section-title">Order Summary</h2>
            <div className="customer-order-summary-content">
              <div className="customer-order-summary-row">
                <span className="customer-order-summary-label">Order Status:</span>
                <span className={`badge ${
                  order.orderStatus === 'confirmed' || order.orderStatus === 'delivered' ? 'badge-success' :
                  order.orderStatus === 'pending' || order.orderStatus === 'processing' ? 'badge-warning' :
                  'badge-danger'
                }`}>
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </span>
              </div>
              <div className="customer-order-summary-row">
                <span className="customer-order-summary-label">Order Date:</span>
                <span className="customer-order-summary-value">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="customer-order-summary-row">
                <span className="customer-order-summary-label">Total Amount:</span>
                <span className="customer-order-total-amount">USD {order.total.toFixed(2)}</span>
              </div>
              {order.estimatedDelivery && (
                <div className="customer-order-summary-row">
                  <span className="customer-order-summary-label customer-order-summary-with-icon">
                    <Truck className="customer-order-summary-icon" />
                    Estimated Delivery:
                  </span>
                  <span className="customer-order-summary-value">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                </div>
              )}
              {order.trackingNumber && (
                <div className="customer-order-summary-row">
                  <span className="customer-order-summary-label customer-order-summary-with-icon">
                    <Clipboard className="customer-order-summary-icon" />
                    Tracking Number:
                  </span>
                  <span className="customer-order-tracking-number">{order.trackingNumber}</span>
                </div>
              )}
            </div>

            <div className="customer-order-items-section">
              <h3 className="customer-order-items-title">Items Ordered</h3>
              <div className="customer-order-items-list">
                <ul className="customer-order-items-ul">
                  {order.items.map((item) => (
                    <li key={item.productId} className="customer-order-item">
                      <div className="customer-order-item-image">
                        <img
                          src={item.productSnapshot.image || 'https://via.placeholder.com/150?text=No+Image'}
                          alt={item.productSnapshot.name}
                          className="customer-order-item-img"
                        />
                      </div>

                      <div className="customer-order-item-details">
                        <div>
                          <div className="customer-order-item-header">
                            <h3>
                              <Link to={`/products/${item.productId}`} className="customer-order-item-link">
                                {item.productSnapshot.name}
                              </Link>
                            </h3>
                            <p className="customer-order-item-total">USD {item.total.toFixed(2)}</p>
                          </div>
                          <p className="customer-order-item-quantity">Qty: {item.quantity} @ USD {item.price.toFixed(2)} each</p>
                        </div>
                        <div className="customer-order-item-footer">
                          <p className="customer-order-item-brand">{item.productSnapshot.brand}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Info */}
        <div className="customer-order-detail-sidebar">
          <div className="customer-order-info-card">
            <h2 className="customer-order-section-title customer-order-info-title">
              <MapPin className="customer-order-section-icon" />
              Shipping Address
            </h2>
            <address className="customer-order-shipping-address">
              <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </address>
          </div>

          <div className="customer-order-info-card">
            <h2 className="customer-order-section-title customer-order-info-title">
              <CreditCard className="customer-order-section-icon" />
              Payment Info
            </h2>
            <p className="customer-order-info-item">Method: <span className="customer-order-info-value">{order.paymentMethod.replace(/_/g, ' ').toUpperCase()}</span></p>
            <p className="customer-order-info-item">Payment Status: <span className={`customer-order-info-value ${
              order.paymentStatus === 'paid' ? 'customer-order-payment-paid' : 'customer-order-payment-unpaid'
            }`}>{order.paymentStatus.toUpperCase()}</span></p>
          </div>

          {order.notes && (
            <div className="customer-order-info-card">
              <h2 className="customer-order-section-title">Order Notes</h2>
              <p className="customer-order-notes">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
