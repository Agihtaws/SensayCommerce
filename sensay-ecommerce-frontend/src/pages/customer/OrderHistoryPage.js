import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import Loading from '../../components/common/Loading';
import { Package, Calendar, Truck, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/OrderHistoryPage.css'; // Import the custom CSS

const OrderHistoryPage = () => {
  const { isAuthenticated, isCustomer } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isCustomer()) {
      toast.error('Please login as a customer to view your order history.');
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, isCustomer, navigate, currentPage, selectedStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        status: selectedStatus || undefined,
      };
      const data = await orderService.getOrders(params);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error.message);
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1); // Reset to first page
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    toast.success('Order history refreshed');
  };

  if (loading) {
    return <Loading text="Loading your order history..." />;
  }

  if (orders.length === 0 && !selectedStatus) {
    return (
      <div className="order-history-empty-state-container">
        <Package className="order-history-empty-icon" />
        <h3 className="order-history-empty-title">No orders found</h3>
        <p className="order-history-empty-message">
          Looks like you haven't placed any orders yet.
        </p>
        <Link
          to="/products"
          className="btn btn-primary order-history-empty-state-btn"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="order-history-page-container">
      <h1 className="order-history-page-title">My Orders</h1>

      <div className="order-history-filters-refresh-bar">
        <div className="order-history-filter-group">
          <label htmlFor="statusFilter" className="order-history-filter-label">Filter by Status:</label>
          <select
            id="statusFilter"
            value={selectedStatus}
            onChange={handleStatusChange}
            className="form-select order-history-filter-select"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-secondary"
        >
          <RefreshCw className={`btn-icon ${refreshing ? 'spinner' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="order-history-table-card">
        <div className="order-history-table-wrapper">
          {/* Table Header */}
          <div className="order-history-table-header-wrapper">
            <div className="order-history-table-header-grid">
              <div className="order-history-header-cell">Order #</div>
              <div className="order-history-header-cell">Date</div>
              <div className="order-history-header-cell">Total</div>
              <div className="order-history-header-cell">Status</div>
              <div className="order-history-header-cell">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="order-history-table-body">
            {orders.length === 0 ? (
              <div className="order-history-no-results">
                <AlertCircle className="order-history-no-results-icon" />
                <h3 className="order-history-no-results-title">No orders matching criteria</h3>
                <p className="order-history-no-results-text">
                  Try clearing your filters or check back later.
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="order-history-table-row">
                  <div className="order-history-table-cell-grid">
                    {/* Order # */}
                    <div className="order-history-cell" data-label="Order #">
                      <Link to={`/orders/${order.orderNumber}`} className="order-history-order-number-link">
                        {order.orderNumber}
                      </Link>
                    </div>

                    {/* Date */}
                    <div className="order-history-cell" data-label="Date">
                      <div className="order-history-date-text">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="order-history-cell" data-label="Total">
                      <div className="order-history-total-amount">
                        USD {order.total.toFixed(2)}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="order-history-cell" data-label="Status">
                      <span className={`badge ${
                        order.orderStatus === 'confirmed' || order.orderStatus === 'delivered' ? 'badge-success' :
                        order.orderStatus === 'pending' || order.orderStatus === 'processing' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="order-history-cell" data-label="Actions">
                      <Link to={`/orders/${order.orderNumber}`} className="order-history-view-details-link">
                        View Details
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
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
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
              <div>
                <nav className="pagination-nav">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="pagination-nav-btn prev"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      aria-current={currentPage === page ? 'page' : undefined}
                      className={`pagination-nav-btn ${
                        currentPage === page
                          ? 'active'
                          : ''
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= pagination.pages}
                    className="pagination-nav-btn next"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
