import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Loading from '../../components/common/Loading';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Coins,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/AdminAnalyticsPage.css';

const AdminAnalyticsPage = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalyticsData = async () => {
    try {
      const productsResponse = await api.get('/products/admin/all?limit=1');
      const ordersResponse = await api.get('/orders/admin/all?limit=1');
      const customerStatsResponse = await api.get('/auth/admin/customers/stats');
      const balanceResponse = await api.get('/sensay-balance');
      const transactionsResponse = await api.get('/sensay-balance/transactions?limit=10');
      const statusResponse = await api.get('/sensay/status');

      setAnalyticsData({
        products: {
          total: productsResponse.data.data.pagination.total,
        },
        orders: ordersResponse.data.data.stats,
        customers: customerStatsResponse.data.data,
        sensay: {
          balance: balanceResponse.data.data,
          transactions: transactionsResponse.data.data.transactions,
          systemStatus: statusResponse.data.data,
        },
      });
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    toast.success('Analytics refreshed');
  };

  if (loading) {
    return <Loading text="Loading analytics..." />;
  }

  if (!analyticsData) {
    return (
      <div className="analytics-error-container">
        <AlertCircle size={48} className="analytics-error-icon" />
        <h3 className="analytics-error-title">Failed to load analytics</h3>
        <p className="analytics-error-message">Please try refreshing the page.</p>
        <button
          onClick={fetchAnalyticsData}
          className="btn btn-primary"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  const overviewStats = [
    {
      name: 'Total Revenue',
      stat: `USD ${analyticsData.orders.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      colorClass: 'stat-icon-green',
    },
    {
      name: 'Total Orders',
      stat: analyticsData.orders.totalOrders,
      icon: ShoppingCart,
      colorClass: 'stat-icon-blue',
    },
    {
      name: 'Total Products',
      stat: analyticsData.products.total,
      icon: Package,
      colorClass: 'stat-icon-purple',
    },
    {
      name: 'Total Customers',
      stat: analyticsData.customers.totalCustomers,
      icon: Users,
      colorClass: 'stat-icon-yellow',
    },
  ];

  const orderStatusStats = [
    { name: 'Pending', stat: analyticsData.orders.pendingOrders, icon: Clock, colorClass: 'text-yellow' },
    { name: 'Confirmed', stat: analyticsData.orders.confirmedOrders, icon: CheckCircle, colorClass: 'text-green' },
    { name: 'Processing', stat: analyticsData.orders.processingOrders, icon: Activity, colorClass: 'text-blue' },
    { name: 'Shipped', stat: analyticsData.orders.shippedOrders, icon: Truck, colorClass: 'text-purple' },
    { name: 'Delivered', stat: analyticsData.orders.deliveredOrders, icon: CheckCircle, colorClass: 'text-green-dark' },
    { name: 'Cancelled', stat: analyticsData.orders.cancelledOrders, icon: XCircle, colorClass: 'text-red' },
  ];

  const customerGrowthStats = [
    { name: 'Active Customers', stat: analyticsData.customers.activeCustomers, icon: Users, colorClass: 'text-green' },
    { name: 'New this Month', stat: analyticsData.customers.newCustomers, icon: Users, colorClass: 'text-blue' },
  ];

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'chat_completion': return <MessageSquare size={16} className="text-blue" />;
      case 'knowledge_update': return <Package size={16} className="text-green" />;
      case 'replica_creation': return <Activity size={16} className="text-purple" />;
      case 'balance_refill': return <Coins size={16} className="text-gray" />;
      case 'adjustment': return <Coins size={16} className="text-yellow" />;
      default: return <AlertCircle size={16} className="text-gray" />;
    }
  };

  return (
    <div className="admin-analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-header-content">
          <div>
            <h1 className="analytics-title">Analytics Dashboard</h1>
            <p className="analytics-subtitle">
              Get insights into your e-commerce platform's performance and Sensay AI usage.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-secondary"
          >
            <RefreshCw size={16} className={refreshing ? 'spinner' : ''} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="overview-stats-grid">
        {overviewStats.map((item) => {
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
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Status & Customer Growth */}
      <div className="section-grid">
        {/* Order Status Breakdown */}
        <div className="card">
          <h2 className="card-title">Order Status Breakdown</h2>
          <div className="status-breakdown-grid">
            {orderStatusStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} className="status-breakdown-item">
                  <div>
                    <div className="status-breakdown-name">{item.name}</div>
                    <div className="status-breakdown-value">{item.stat}</div>
                  </div>
                  <Icon size={32} className={item.colorClass} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Growth */}
        <div className="card">
          <h2 className="card-title">Customer Insights</h2>
          <div className="status-breakdown-grid">
            {customerGrowthStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} className="status-breakdown-item">
                  <div>
                    <div className="status-breakdown-name">{item.name}</div>
                    <div className="status-breakdown-value">{item.stat}</div>
                  </div>
                  <Icon size={32} className={item.colorClass} />
                </div>
              );
            })}
          </div>
          <div className="customer-insights-footer">
            <Link to="/admin/customers" className="link-primary">
              View all customers <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sensay AI Usage */}
      <div className="card sensay-usage-card">
        <h2 className="card-title">Sensay AI Usage</h2>
        <div className="sensay-usage-grid">
          {/* Current Balance */}
          <div className="sensay-usage-item">
            <div>
              <div className="sensay-usage-name">Current Balance</div>
              <div className="sensay-usage-value">
                {analyticsData.sensay.balance.currentBalance?.toLocaleString() || 0} units
              </div>
            </div>
            <Coins size={32} className="text-green" />
          </div>
          {/* Total Spent */}
          <div className="sensay-usage-item">
            <div>
              <div className="sensay-usage-name">Total Units Spent</div>
              <div className="sensay-usage-value">
                {analyticsData.sensay.balance.totalSpent?.toLocaleString() || 0} units
              </div>
            </div>
            <TrendingUp size={32} className="text-red" />
          </div>
          {/* System Mode */}
          <div className="sensay-usage-item">
            <div>
              <div className="sensay-usage-name">Sensay Mode</div>
              <div className="sensay-usage-value">
                {analyticsData.sensay.systemStatus.system?.mode || 'N/A'}
              </div>
            </div>
            <MessageSquare size={32} className="text-blue" />
          </div>
        </div>
        
        {/* Recent Sensay Transactions */}
        <div className="sensay-transactions-section">
          <h3 className="sensay-transactions-title">
            Recent Sensay Transactions
          </h3>
          <div className="transaction-timeline">
            <ul className="transaction-list">
              {analyticsData.sensay.transactions.map((transaction, index) => (
                <li key={transaction._id}>
                  <div className="transaction-item">
                    {index !== analyticsData.sensay.transactions.length - 1 && (
                      <span className="transaction-line" />
                    )}
                    <div className="transaction-content">
                      <div className={`transaction-icon-wrapper ${
                        transaction.transactionType === 'chat_completion' ? 'bg-blue' :
                        transaction.transactionType === 'knowledge_update' ? 'bg-green' :
                        transaction.transactionType === 'replica_creation' ? 'bg-purple' :
                        transaction.transactionType === 'balance_refill' ? 'bg-gray' :
                        'bg-yellow'
                      }`}>
                        {getTransactionIcon(transaction.transactionType)}
                      </div>
                      <div className="transaction-details">
                        <div className="transaction-description">
                          {transaction.description}
                        </div>
                        <p className="transaction-amount">
                          Amount: {transaction.amount} units • Balance After: {transaction.balanceAfter}
                        </p>
                        <p className="transaction-time">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
