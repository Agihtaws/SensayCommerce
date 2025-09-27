import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import Loading from '../../components/common/Loading';
import {
  ShoppingCart,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle,
  Truck,
  Archive,
  XCircle,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/AdminOrderListPage.css';

const AdminOrderListPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const orderStatuses = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        status: selectedStatus || undefined,
        search: searchTerm || undefined,
      };
      const data = await orderService.getAdminOrders(params);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error.message);
      console.error('Failed to fetch admin orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, selectedStatus]); // Depend on currentPage and selectedStatus

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on search
    fetchOrders();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1); // Reset to first page on refresh
    setSearchTerm(''); // Clear search on refresh
    setSelectedStatus(''); // Clear status on refresh
    await fetchOrders();
    toast.success('Orders refreshed');
  };

  const handleUpdateStatus = async (orderNumber, newStatus) => {
    if (!window.confirm(`Are you sure you want to change status of order ${orderNumber} to ${newStatus.toUpperCase()}?`)) {
      return;
    }
    setUpdatingOrderId(orderNumber);
    try {
      await orderService.updateOrderStatus(orderNumber, newStatus);
      await fetchOrders(); // Re-fetch orders to show updated status
      toast.success(`Order ${orderNumber} status updated to ${newStatus.toUpperCase()}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="order-list-status-icon order-list-status-pending" />;
      case 'confirmed': return <CheckCircle className="order-list-status-icon order-list-status-confirmed" />;
      case 'processing': return <Activity className="order-list-status-icon order-list-status-processing" />;
      case 'shipped': return <Truck className="order-list-status-icon order-list-status-shipped" />;
      case 'delivered': return <CheckCircle className="order-list-status-icon order-list-status-delivered" />;
      case 'cancelled': return <XCircle className="order-list-status-icon order-list-status-cancelled" />;
      default: return <AlertCircle className="order-list-status-icon order-list-status-default" />;
    }
  };

  if (loading) {
    return <Loading text="Loading all orders..." />;
  }

  if (orders.length === 0 && !searchTerm && !selectedStatus) {
    return (
      <div className="order-list-empty-state">
        <ShoppingCart className="order-list-empty-icon" />
        <h3 className="order-list-empty-title">No orders placed yet</h3>
        <p className="order-list-empty-text">
          Looks like your customers haven't made any purchases.
        </p>
      </div>
    );
  }

  return (
    <div className="order-list-page">
      <h1 className="order-list-title">All Orders</h1>

      {/* Filters and Search */}
      <div className="order-list-filters">
        {/* Status Filter */}
        <div className="order-list-filter-group">
          <label htmlFor="statusFilter" className="order-list-filter-label">Status:</label>
          <select
            id="statusFilter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-select"
          >
            {orderStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="order-list-search-form">
          <div className="order-list-search-input">
            <div className="order-list-search-icon">
              <Search className="search-icon" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input order-list-search-field"
              placeholder="Search by Order #, Customer, City..."
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Search
          </button>
        </form>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-secondary"
        >
          <RefreshCw className={`btn-icon ${refreshing ? 'spinner' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Orders Table */}
      <div className="order-list-table-container">
        <div className="order-list-table-wrapper">
          {/* Table Header */}
          <div className="order-list-table-header">
            <div className="order-list-header-grid">
              <div className="order-list-header-cell order-list-col-order">Order #</div>
              <div className="order-list-header-cell order-list-col-customer">Customer</div>
              <div className="order-list-header-cell order-list-col-total">Total</div>
              <div className="order-list-header-cell order-list-col-status">Status</div>
              <div className="order-list-header-cell order-list-col-actions">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="order-list-table-body">
            {orders.length === 0 ? (
              <div className="order-list-no-results">
                <ShoppingCart className="order-list-no-results-icon" />
                <h3 className="order-list-no-results-title">No orders found</h3>
                <p className="order-list-no-results-text">
                  {searchTerm || selectedStatus ? 'Try adjusting your filters or search terms.' : 'Customers will start placing orders soon!'}
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="order-list-row">
                  <div className="order-list-row-grid">
                    {/* Order # */}
                    <div className="order-list-cell order-list-col-order">
                      <Link to={`/admin/orders/${order.orderNumber}`} className="order-list-order-link">
                        {order.orderNumber}
                      </Link>
                      <p className="order-list-order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>

                    {/* Customer */}
                    <div className="order-list-cell order-list-col-customer">
                      <div className="order-list-customer-name">
                        {order.userId?.firstName} {order.userId?.lastName}
                      </div>
                      <div className="order-list-customer-email">{order.userId?.email}</div>
                    </div>

                    {/* Total */}
                    <div className="order-list-cell order-list-col-total">
                      <div className="order-list-total-amount">
                        USD {order.total.toFixed(2)}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="order-list-cell order-list-col-status">
                      <div className="order-list-status-display">
                        {getStatusIcon(order.orderStatus)}
                        <span className={`badge ${
                          order.orderStatus === 'delivered' ? 'badge-success' :
                          ['pending', 'confirmed', 'processing', 'shipped'].includes(order.orderStatus) ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="order-list-cell order-list-col-actions">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateStatus(order.orderNumber, e.target.value)}
                        disabled={updatingOrderId === order.orderNumber}
                        className="form-select order-list-status-select"
                      >
                        {orderStatuses.slice(1).map(status => ( // Exclude 'All Statuses'
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <Link to={`/admin/orders/${order.orderNumber}`} className="order-list-view-link">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="pagination-container">
            <div className="pagination-mobile">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= pagination.pages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
            
            <div className="pagination-desktop">
              <div>
                <p className="pagination-info">
                  Showing{' '}
                  <span className="font-medium">
                    {((currentPage - 1) * pagination.limit) + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pagination.limit, pagination.total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.total}</span>{' '}
                  results
                </p>
              </div>
              <nav className="pagination-nav">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="pagination-nav-btn prev"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={`pagination-nav-btn ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= pagination.pages}
                  className="pagination-nav-btn next"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderListPage;
