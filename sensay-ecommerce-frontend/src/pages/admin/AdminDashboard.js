import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Coins,
  MessageSquare,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
} from 'lucide-react';
import api from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, sensayBalance } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const productsResponse = await api.get('/products/admin/all?limit=5');
      const balanceResponse = await api.get('/sensay-balance');
      const transactionsResponse = await api.get('/sensay-balance/transactions?limit=5');
      const statusResponse = await api.get('/sensay/status');
      const allOrdersResponse = await api.get('/orders/admin/all?limit=1'); 
      const customerStatsResponse = await api.get('/auth/admin/customers/stats');

      const data = {
        products: {
          total: productsResponse.data.data.pagination.total,
          recent: productsResponse.data.data.products,
        },
        balance: balanceResponse.data.data,
        transactions: transactionsResponse.data.data.transactions,
        systemStatus: statusResponse.data.data,
        orders: { 
          total: allOrdersResponse.data.data.stats.totalOrders,
          pending: allOrdersResponse.data.data.stats.pendingOrders,
          completed: allOrdersResponse.data.data.stats.deliveredOrders + allOrdersResponse.data.data.stats.shippedOrders + allOrdersResponse.data.data.stats.confirmedOrders, 
          revenue: allOrdersResponse.data.data.stats.totalRevenue,
          recent: allOrdersResponse.data.data.orders,
        },
        customers: { 
          total: customerStatsResponse.data.data.totalCustomers,
          active: customerStatsResponse.data.data.activeCustomers,
          new: customerStatsResponse.data.data.newCustomers,
        },
      };

      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    toast.success('Dashboard refreshed');
  };

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  if (!dashboardData) {
    return (
      <div className="empty-state-container">
        <AlertCircle size={48} className="empty-state-icon" />
        <h3 className="empty-state-title">Failed to load dashboard</h3>
        <p className="empty-state-message">Please try refreshing the page.</p>
        <button
          onClick={fetchDashboardData}
          className="btn btn-primary"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Products',
      stat: dashboardData.products.total,
      icon: Package,
      change: '', 
      changeType: 'increase',
      colorClass: 'stat-icon-blue',
    },
    {
      name: 'Total Orders',
      stat: dashboardData.orders.total,
      icon: ShoppingCart,
      change: '', 
      changeType: 'increase',
      colorClass: 'stat-icon-green',
    },
    {
      name: 'Total Customers',
      stat: dashboardData.customers.total,
      icon: Users,
      change: '', 
      changeType: 'increase',
      colorClass: 'stat-icon-purple',
    },
    {
      name: 'Revenue',
      stat: `USD ${dashboardData.orders.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      change: '', 
      changeType: 'increase',
      colorClass: 'stat-icon-yellow',
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'synced':
        return <CheckCircle size={20} className="status-icon-success" />;
      case 'pending':
        return <Activity size={20} className="status-icon-warning" />;
      case 'error':
        return <XCircle size={20} className="status-icon-error" />;
      default:
        return <AlertCircle size={20} className="status-icon-default" />;
    }
  };

  return (
    <div className="admin-dashboard-page">
      {/* Welcome Section */}
      <div className="dashboard-welcome-section">
        <div className="dashboard-welcome-content">
          <div>
            <h1 className="dashboard-welcome-title">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="dashboard-welcome-subtitle">
              Here's what's happening with your e-commerce platform today.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-secondary"
          >
            <RefreshCw size={16} className={refreshing ? 'spinner' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="overview-stats-grid">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="overview-stat-card">
              <div className="stat-header">
                <div className={`overview-stat-icon-wrapper ${item.colorClass}`}>
                  <Icon size={24} color="white" />
                </div>
                <p className="overview-stat-name">{item.name}</p>
              </div>
              <div className="overview-stat-value">
                <p className="stat-number">{item.stat}</p>
                {item.change && ( 
                  <p className={`stat-change ${item.changeType === 'increase' ? 'positive' : 'negative'}`}>
                    <TrendingUp size={16} className={`trend-icon ${item.changeType === 'increase' ? 'up' : 'down'}`} />
                    <span className="sr-only">
                      {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                    </span>
                    {item.change}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sensay System Status */}
      <div className="section-grid">
        <div className="card">
          <div className="card-body">
            <div className="sensay-balance-section">
              <div className="stat-icon-wrapper-small bg-green">
                <Coins size={32} color="white" />
              </div>
              <div className="sensay-balance-info">
                <div className="stat-label">
                  Sensay Balance
                </div>
                <div className="sensay-balance-value">
                  <div className="balance-amount">
                    {dashboardData.balance.currentBalance?.toLocaleString() || 0}
                    &nbsp;units
                  </div>
                </div>
              </div>
            </div>
            <div className="sensay-balance-details">
              <div className="balance-detail-row">
                <span>Total Spent: {dashboardData.balance.totalSpent?.toLocaleString() || 0} units</span>
                <span>Last Updated: {new Date(dashboardData.balance.lastUpdated).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="sensay-system-section">
              <div className="stat-icon-wrapper-small bg-blue">
                <MessageSquare size={32} color="white" />
              </div>
              <div className="sensay-system-info">
                <div className="stat-label">
                  Sensay System Status
                </div>
                <div className="sensay-system-value">
                  <div className="system-mode">
                    {dashboardData.systemStatus.system?.mode || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
            <div className="sensay-system-details">
              <div className="system-detail-row">
                <span className="detail-label">Organization ID:</span>
                <span className="code">
                  {dashboardData.systemStatus.system?.organizationId?.substring(0, 8) || 'N/A'}...
                </span>
              </div>
              <div className="system-detail-row">
                <span className="detail-label">Replica UUID:</span>
                <span className="code">
                  {dashboardData.systemStatus.system?.replicaUUID?.substring(0, 8) || 'N/A'}...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section-grid">
        {/* Recent Products */}
        <div className="card">
          <div className="card-body">
            <h3 className="card-title">
              Recent Products
            </h3>
            <div className="timeline-container">
              <ul className="timeline-list">
                {dashboardData.products.recent.map((product, index) => (
                  <li key={product._id}>
                    <div className="timeline-item">
                      {index !== dashboardData.products.recent.length - 1 && (
                        <span className="timeline-line" />
                      )}
                      <div className="timeline-content">
                        <div className="timeline-icon-wrapper bg-gray">
                          <Package size={20} color="white" />
                        </div>
                        <div className="timeline-status-icon">
                          {getStatusIcon(product.sensayStatus)}
                        </div>
                        <div className="timeline-details">
                          <div className="timeline-title">
                            <Link to={`/admin/products/edit/${product._id}`} className="link-primary">
                              {product.name}
                            </Link>
                          </div>
                          <p className="timeline-subtitle">
                            {product.brand} • USD {product.price} • Stock: {product.stock}
                          </p>
                          <p className="timeline-time">
                            SKU: {product.sku} • Sensay: {product.sensayStatus}
                          </p>
                          <div className="timeline-description">
                            <p>{product.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul >
            </div>
            <div className="timeline-footer">
              <Link to="/admin/products" className="link-primary">
                View all products <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Sensay Transactions */}
        <div className="card">
          <div className="card-body">
            <h3 className="card-title">
              Recent Sensay Transactions
            </h3>
            <div className="timeline-container">
              <ul className="timeline-list">
                {dashboardData.transactions.map((transaction, index) => (
                  <li key={transaction._id}>
                    <div className="timeline-item">
                      {index !== dashboardData.transactions.length - 1 && (
                        <span className="timeline-line" />
                      )}
                      <div className="timeline-content">
                        <div className={`timeline-icon-wrapper ${
                          transaction.transactionType === 'chat_completion' ? 'bg-blue' :
                          transaction.transactionType === 'knowledge_update' ? 'bg-green' :
                          transaction.transactionType === 'replica_creation' ? 'bg-purple' :
                          'bg-gray'
                        }`}>
                          {transaction.transactionType === 'chat_completion' && (
                            <MessageSquare size={20} color="white" />
                          )}
                          {transaction.transactionType === 'knowledge_update' && (
                            <Package size={20} color="white" />
                          )}
                          {transaction.transactionType === 'replica_creation' && (
                            <Activity size={20} color="white" />
                          )}
                          {transaction.transactionType === 'balance_refill' && (
                            <Coins size={20} color="white" />
                          )}
                        </div>
                        <div className="timeline-details">
                          <div className="timeline-title">
                            {transaction.description}
                          </div>
                          <p className="timeline-subtitle">
                            -{transaction.amount} units • Balance: {transaction.balanceAfter}
                          </p>
                          <p className="timeline-time">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="timeline-footer">
              <Link to="/admin/sensay-transactions" className="link-primary">
                View all transactions <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders for Admin */}
      <div className="card recent-orders-card">
        <h2 className="card-title">Recent Orders</h2>
        <div className="orders-container">
          <ul className="order-list">
            {dashboardData.orders.recent.length === 0 ? (
              <div className="orders-empty-state">No recent orders.</div>
            ) : (
              dashboardData.orders.recent.map((order, index) => (
                <li key={order._id} className="order-list-item">
                  <div>
                    <Link to={`/admin/orders/${order.orderNumber}`} className="order-link">
                      Order #{order.orderNumber}
                    </Link>
                    <p className="order-customer">
                      Customer: {order.userId?.firstName} {order.userId?.lastName}
                    </p>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="order-status-price">
                    <span className={`badge ${
                      order.orderStatus === 'delivered' ? 'badge-success' :
                      ['pending', 'confirmed', 'processing', 'shipped'].includes(order.orderStatus) ? 'badge-warning' :
                      'badge-danger'
                    }`}>
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                    <span className="order-total">
                      USD {order.total.toFixed(2)}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="orders-footer">
          <Link to="/admin/orders" className="link-primary">
            View all orders <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card quick-actions-card">
        <div className="card-body">
          <h3 className="card-title">
            Quick Actions
          </h3>
          <div className="quick-actions-grid">
            <Link to="/admin/products/new" className="btn btn-primary">
              <Plus size={16} />
              Add Product
            </Link>
            <Link to="/admin/orders" className="btn btn-secondary">
              <ShoppingCart size={16} />
              View Orders
            </Link>
            <Link to="/admin/customers" className="btn btn-secondary">
              <Users size={16} />
              Manage Customers
            </Link>
            <Link to="/admin/chat" className="btn btn-secondary">
              <MessageSquare size={16} />
              Sensay Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
