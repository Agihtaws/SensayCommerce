import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import adminCustomerService from '../../services/adminCustomerService';
import Loading from '../../components/common/Loading';
import {
  Users,
  Search,
  RefreshCw,
  Edit,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/AdminCustomerListPage.css';

const AdminCustomerListPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const customerStatuses = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: selectedStatus || undefined,
      };
      const data = await adminCustomerService.getAllCustomers(params);
      setCustomers(data.customers);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error.message);
      console.error('Failed to fetch admin customers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCustomers();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setSearchTerm('');
    setSelectedStatus('');
    await fetchCustomers();
    toast.success('Customer list refreshed');
  };

  if (loading) {
    return <Loading text="Loading customers..." />;
  }

  if (customers.length === 0 && !searchTerm && !selectedStatus) {
    return (
      <div className="empty-state-container">
        <Users size={96} className="empty-state-icon" />
        <h3 className="empty-state-title">No customers found</h3>
        <p className="empty-state-message">
          Looks like no customers have registered yet.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-customer-list-page">
      <h1 className="page-title">Customer Management</h1>

      {/* Filters and Search */}
      <div className="filter-card">
        {/* Status Filter */}
        <div className="filter-group">
          <label htmlFor="statusFilter" className="filter-label">Status:</label>
          <select
            id="statusFilter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-select"
          >
            {customerStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="input-with-icon">
            <Search size={20} className="input-icon-left" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input search-input"
              placeholder="Search by Name or Email..."
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
          <RefreshCw size={16} className={refreshing ? 'spinner' : ''} />
          Refresh
        </button>
      </div>

      {/* Customers Table */}
      <div className="card table-card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr className="table-header-row">
                <th className="table-header-cell">Name</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="table-empty-state">
                    <Users size={48} className="table-empty-icon" />
                    <h3 className="table-empty-title">No customers found</h3>
                    <p className="table-empty-message">
                      {searchTerm || selectedStatus ? 'Try adjusting your filters or search terms.' : 'Register a new customer to get started.'}
                    </p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className="table-row">
                    <td className="table-cell">
                      <Link to={`/admin/customers/${customer._id}`} className="link-primary">
                        {customer.firstName} {customer.lastName}
                      </Link>
                    </td>

                    <td className="table-cell">
                      {customer.email}
                    </td>

                    <td className="table-cell">
                      <span className={`badge ${customer.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="table-cell">
                      <Link to={`/admin/customers/${customer._id}`} className="link-secondary">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

export default AdminCustomerListPage;
