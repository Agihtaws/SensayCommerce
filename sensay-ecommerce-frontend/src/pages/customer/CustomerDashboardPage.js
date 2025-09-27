import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService'; // Will use this for dashboard data
import Loading from '../../components/common/Loading';
import {
  User,
  ShoppingCart,
  Heart,
  DollarSign,
  Package,
  Calendar,
  Truck,
  MessageSquare,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/CustomerDashboardPage.css';

const CustomerDashboardPage = () => {
  const { user, isAuthenticated, isCustomer } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isCustomer()) {
      toast.error('Please login as a customer to view your dashboard.');
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, isCustomer, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await chatService.getDashboardData(); // Using chatService for dashboard endpoint
      setDashboardData(data);
    } catch (error) {
      toast.error(error.message);
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading your dashboard..." />;
  }

  if (!dashboardData) {
    return (
      <div className="customer-dashboard-error-container">
        <AlertCircle className="customer-dashboard-error-icon" />
        <h3 className="customer-dashboard-error-title">Failed to load dashboard</h3>
        <p className="customer-dashboard-error-message">Please try refreshing the page.</p>
        <button
          onClick={fetchDashboardData}
          className="btn btn-primary"
        >
          <RefreshCw className="btn-icon" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="customer-dashboard-page">
      <h1 className="customer-dashboard-title">My Dashboard</h1>

      {/* Welcome Section */}
      <div className="customer-dashboard-welcome-card">
        <h2 className="customer-dashboard-welcome-title">
          Hello, {dashboardData.user.name}!
        </h2>
        <p className="customer-dashboard-welcome-text">
          Welcome to your personalized dashboard. Here you can manage your orders, wishlist, and account details.
        </p>
      </div>

      <div className="customer-dashboard-stats-grid">
        {/* Cart Summary */}
        <div className="customer-dashboard-stat-card">
          <div className="customer-dashboard-stat-info">
            <h3 className="customer-dashboard-stat-label">Items in Cart</h3>
            <p className="customer-dashboard-stat-value">
              {dashboardData.cart.itemCount}
            </p>
            <p className="customer-dashboard-stat-subtext">Total: USD {dashboardData.cart.total.toFixed(2)}</p>
          </div>
          <ShoppingCart className="customer-dashboard-stat-icon customer-dashboard-icon-blue" />
        </div>

        {/* Wishlist Summary */}
        <div className="customer-dashboard-stat-card">
          <div className="customer-dashboard-stat-info">
            <h3 className="customer-dashboard-stat-label">Items in Wishlist</h3>
            <p className="customer-dashboard-stat-value">
              {dashboardData.wishlist.itemCount}
            </p>
          </div>
          <Heart className="customer-dashboard-stat-icon customer-dashboard-icon-red" />
        </div>

        {/* Total Orders */}
        <div className="customer-dashboard-stat-card">
          <div className="customer-dashboard-stat-info">
            <h3 className="customer-dashboard-stat-label">Total Orders</h3>
            <p className="customer-dashboard-stat-value">
              {dashboardData.orders.total}
            </p>
            <p className="customer-dashboard-stat-subtext">Total Spent: USD {dashboardData.orders.totalSpent.toFixed(2)}</p>
          </div>
          <Package className="customer-dashboard-stat-icon customer-dashboard-icon-green" />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="customer-dashboard-recent-orders-card">
        <h2 className="customer-dashboard-section-title">Recent Orders</h2>
        {dashboardData.orders.recent.length === 0 ? (
          <p className="customer-dashboard-empty-text">You have no recent orders.</p>
        ) : (
          <div className="customer-dashboard-orders-table-responsive">
            <table className="customer-dashboard-orders-table">
              <thead>
                <tr>
                  <th className="customer-dashboard-table-header">
                    Order #
                  </th>
                  <th className="customer-dashboard-table-header">
                    Date
                  </th>
                  <th className="customer-dashboard-table-header">
                    Total
                  </th>
                  <th className="customer-dashboard-table-header">
                    Status
                  </th>
                  <th className="customer-dashboard-table-header sr-only">
                    View Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.orders.recent.map((order) => (
                  <tr key={order._id}>
                    <td className="customer-dashboard-table-cell customer-dashboard-order-number">
                      <Link to={`/orders/${order.orderNumber}`} className="customer-dashboard-order-link">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="customer-dashboard-table-cell">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="customer-dashboard-table-cell">
                      USD {order.total.toFixed(2)}
                    </td>
                    <td className="customer-dashboard-table-cell">
                      <span className={`badge ${
                        order.orderStatus === 'confirmed' ? 'badge-success' :
                        order.orderStatus === 'pending' ? 'badge-warning' :
                        'badge-secondary'
                      }`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                    <td className="customer-dashboard-table-cell customer-dashboard-view-details">
                      <Link to={`/orders/${order.orderNumber}`} className="customer-dashboard-view-link">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="customer-dashboard-quick-actions-card">
        <h2 className="customer-dashboard-section-title">Quick Actions</h2>
        <div className="customer-dashboard-quick-actions-grid">
          <Link
            to="/products"
            className="btn btn-primary customer-dashboard-action-btn"
          >
            <ShoppingCart className="btn-icon" />
            Continue Shopping
          </Link>
          <Link
            to="/orders"
            className="btn btn-secondary customer-dashboard-action-btn"
          >
            <Package className="btn-icon" />
            View All Orders
          </Link>
          <Link
            to="/wishlist"
            className="btn btn-secondary customer-dashboard-action-btn"
          >
            <Heart className="btn-icon" />
            View Wishlist
          </Link>
          
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
