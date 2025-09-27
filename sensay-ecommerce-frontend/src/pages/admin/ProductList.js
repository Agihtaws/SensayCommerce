import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
} from 'lucide-react';
import productService from '../../services/productService';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import '../../styles/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [syncingProduct, setSyncingProduct] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async (page = 1, search = '') => {
    try {
      setLoading(page === 1);
      
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
      };

      const data = await productService.getAdminProducts(params);
      setProducts(data.products);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (error) {
      toast.error(error.message);
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1, searchTerm);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(currentPage, searchTerm);
    toast.success('Products refreshed');
  };

  const handleSyncWithSensay = async (productId, productName) => {
    try {
      setSyncingProduct(productId);
      await productService.syncWithSensay(productId);
      
      // Refresh products to show updated sync status
      await fetchProducts(currentPage, searchTerm);
      toast.success(`${productName} synced with Sensay AI`);
    } catch (error) {
      toast.error(`Failed to sync ${productName}: ${error.message}`);
    } finally {
      setSyncingProduct(null);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This will also remove it from Sensay AI.`)) {
      return;
    }

    try {
      await productService.deleteProduct(productId);
      await fetchProducts(currentPage, searchTerm);
      toast.success(`${productName} deleted successfully`);
    } catch (error) {
      toast.error(`Failed to delete ${productName}: ${error.message}`);
    }
  };

  const getSensayStatusBadge = (status) => {
    switch (status) {
      case 'synced':
        return (
          <span className="product-status-badge product-status-synced">
            <CheckCircle className="product-status-icon" />
            Synced
          </span>
        );
      case 'pending':
        return (
          <span className="product-status-badge product-status-pending">
            <Activity className="product-status-icon" />
            Pending
          </span>
        );
      case 'error':
        return (
          <span className="product-status-badge product-status-error">
            <XCircle className="product-status-icon" />
            Error
          </span>
        );
      default:
        return (
          <span className="product-status-badge product-status-unknown">
            <AlertCircle className="product-status-icon" />
            Unknown
          </span>
        );
    }
  };

  if (loading) {
    return <Loading text="Loading products..." />;
  }

  return (
    <div className="product-list-page">
      {/* Header */}
      <div className="product-list-header">
        <div className="product-list-header-content">
          <div>
            <h1 className="product-list-title">Products</h1>
            <p className="product-list-subtitle">
              Manage your product catalog and Sensay AI integration
            </p>
          </div>
          <div className="product-list-actions">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-secondary"
            >
              <RefreshCw className={`btn-icon ${refreshing ? 'spinner' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/admin/products/new')}
              className="btn btn-primary"
            >
              <Plus className="btn-icon" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="product-list-search-card">
        <form onSubmit={handleSearch} className="product-list-search-form">
          <div className="product-list-search-input-wrapper">
            <div className="product-list-search-icon">
              <Search className="search-icon" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input product-list-search-input"
              placeholder="Search products by name, SKU, or brand..."
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
          >
            <Search className="btn-icon" />
            Search
          </button>
          <button
            type="button"
            className="btn btn-secondary"
          >
            <Filter className="btn-icon" />
            Filters
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="product-list-table-container">
        <div className="product-list-table-wrapper">
          {/* Table Header */}
          <div className="product-list-table-header">
            <div className="product-list-header-grid">
              <div className="product-list-header-cell product-list-col-product">Product</div>
              <div className="product-list-header-cell product-list-col-category">Category</div>
              <div className="product-list-header-cell product-list-col-price">Price</div>
              <div className="product-list-header-cell product-list-col-stock">Stock</div>
              <div className="product-list-header-cell product-list-col-sensay">Sensay Status</div>
              <div className="product-list-header-cell product-list-col-status">Status</div>
              <div className="product-list-header-cell product-list-col-actions">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="product-list-table-body">
            {products.length === 0 ? (
              <div className="product-list-empty-state">
                <Package className="product-list-empty-icon" />
                <h3 className="product-list-empty-title">No products found</h3>
                <p className="product-list-empty-text">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new product.'}
                </p>
                {!searchTerm && (
                  <div className="product-list-empty-actions">
                    <button
                      onClick={() => navigate('/admin/products/new')}
                      className="btn btn-primary"
                    >
                      <Plus className="btn-icon" />
                      Add Product
                    </button>
                  </div>
                )}
              </div>
            ) : (
              products.map((product) => (
                <div key={product._id} className="product-list-row">
                  <div className="product-list-row-grid">
                    {/* Product Info */}
                    <div className="product-list-cell product-list-col-product">
                      <div className="product-list-product-info">
                        <div className="product-list-product-image">
                          {product.images && product.images.length > 0 ? (
                            <img
                              className="product-list-image"
                              src={product.images[0].url}
                              alt={product.name}
                            />
                          ) : (
                            <div className="product-list-image-placeholder">
                              <Package className="product-list-placeholder-icon" />
                            </div>
                          )}
                        </div>
                        <div className="product-list-product-details">
                          <div className="product-list-product-name">
                            {product.name}
                          </div>
                          <div className="product-list-product-meta">
                            {product.brand} • SKU: {product.sku}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="product-list-cell product-list-col-category">
                      <span className="product-category-badge">
                        {product.category}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="product-list-cell product-list-col-price">
                      <div className="product-list-price">
                        USD {product.price}
                      </div>
                      {product.discount > 0 && (
                        <div className="product-list-discount">
                          {product.discount}% off
                        </div>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="product-list-cell product-list-col-stock">
                      <div className={`product-list-stock ${
                        product.stock > 10 ? 'product-stock-high' : 
                        product.stock > 0 ? 'product-stock-medium' : 'product-stock-low'
                      }`}>
                        {product.stock}
                      </div>
                    </div>

                    {/* Sensay Status */}
                    <div className="product-list-cell product-list-col-sensay">
                      <div className="product-list-sensay-status">
                        {getSensayStatusBadge(product.sensayStatus)}
                        {product.sensayStatus === 'synced' && (
                          <button
                            onClick={() => handleSyncWithSensay(product._id, product.name)}
                            disabled={syncingProduct === product._id}
                            className="product-list-sync-btn"
                            title="Re-sync with Sensay"
                          >
                            <RefreshCw className={`product-list-sync-icon ${syncingProduct === product._id ? 'spinner' : ''}`} />
                          </button>
                        )}
                      </div>
                      {product.sensayKnowledgeId && (
                        <div className="product-list-knowledge-id">
                          ID: {product.sensayKnowledgeId}
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="product-list-cell product-list-col-status">
                      <span className={`badge ${
                        product.isActive
                          ? 'badge-success'
                          : 'badge-danger'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="product-list-cell product-list-col-actions">
                      <div className="product-list-action-buttons">
                        <button
                          onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                          className="product-list-action-btn product-list-edit-btn"
                          title="Edit product"
                        >
                          <Edit className="product-list-action-icon" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id, product.name)}
                          className="product-list-action-btn product-list-delete-btn"
                          title="Delete product"
                        >
                          <Trash2 className="product-list-action-icon" />
                        </button>
                        <button
                          className="product-list-action-btn product-list-more-btn"
                          title="More options"
                        >
                          <MoreVertical className="product-list-action-icon" />
                        </button>
                      </div>
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
                onClick={() => fetchProducts(currentPage - 1, searchTerm)}
                disabled={currentPage <= 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <button
                onClick={() => fetchProducts(currentPage + 1, searchTerm)}
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
                  onClick={() => fetchProducts(currentPage - 1, searchTerm)}
                  disabled={currentPage <= 1}
                  className="pagination-nav-btn prev"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => fetchProducts(pageNum, searchTerm)}
                      className={`pagination-nav-btn ${
                        currentPage === pageNum ? 'active' : ''
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => fetchProducts(currentPage + 1, searchTerm)}
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

export default ProductList;
