import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import Loading from '../../components/common/Loading';
import ProductCard from '../../components/customer/ProductCard';
import { Search, Filter, ArrowUp, ArrowDown, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/ProductCatalogPage.css'; // Import the custom CSS

const ProductCatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ categories: [], brands: [] });
  
  // Search/Filter state
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(queryParams.get('brand') || '');
  const [minPrice, setMinPrice] = useState(queryParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(queryParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(queryParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get('page')) || 1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        brand: selectedBrand || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort: sortBy,
      };
      
      const data = await productService.getProducts(params);
      setProducts(data.products);
      setPagination(data.pagination);

      const filterData = await productService.getFilters();
      setFilters(filterData);
    } catch (error) {
      toast.error('Failed to load products');
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Update URL params
    const newParams = new URLSearchParams();
    if (searchTerm) newParams.set('search', searchTerm);
    if (selectedCategory) newParams.set('category', selectedCategory);
    if (selectedBrand) newParams.set('brand', selectedBrand);
    if (minPrice) newParams.set('minPrice', minPrice);
    if (maxPrice) newParams.set('maxPrice', maxPrice);
    if (sortBy) newParams.set('sort', sortBy);
    if (currentPage > 1) newParams.set('page', currentPage.toString());
    navigate({ search: newParams.toString() }, { replace: true });

  }, [searchTerm, selectedCategory, selectedBrand, minPrice, maxPrice, sortBy, currentPage, navigate]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when applying filters
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  if (loading) {
    return <Loading text="Loading products..." />;
  }

  return (
    <div className="product-catalog-page-container">
      <h1 className="product-catalog-page-title">Our Products</h1>

      <div className="product-catalog-layout-grid">
        {/* Filters Sidebar */}
        <aside className="product-catalog-filters-sidebar">
          <h2 className="product-catalog-filters-title">Filters</h2>
          <form onSubmit={handleApplyFilters} className="product-catalog-filter-form">
            {/* Search */}
            <div className="form-group">
              <label htmlFor="search" className="form-label">Search</label>
              <div className="product-catalog-input-with-icon">
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input product-catalog-search-input"
                  placeholder="Search products..."
                />
                <div className="product-catalog-input-icon-left">
                  <Search className="product-catalog-icon-svg" />
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="form-group">
              <label htmlFor="category" className="form-label">Category</label>
              <select
                id="category"
                name="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select product-catalog-select"
              >
                <option value="">All Categories</option>
                {filters.categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="form-group">
              <label htmlFor="brand" className="form-label">Brand</label>
              <select
                id="brand"
                name="brand"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="form-select product-catalog-select"
              >
                <option value="">All Brands</option>
                {filters.brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="form-group">
              <label className="form-label">Price Range</label>
              <div className="product-catalog-price-range-inputs">
                <input
                  type="number"
                  name="minPrice"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="form-input product-catalog-price-input"
                />
                <input
                  type="number"
                  name="maxPrice"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="form-input product-catalog-price-input"
                />
              </div>
            </div>

            {/* Sort By */}
            <div className="form-group">
              <label htmlFor="sortBy" className="form-label">Sort By</label>
              <select
                id="sortBy"
                name="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select product-catalog-select"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A-Z</option>
                <option value="name_desc">Name: Z-A</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="product-catalog-filter-actions">
              <button
                type="submit"
                className="btn btn-primary product-catalog-apply-btn"
              >
                <Filter className="btn-icon" />
                Apply Filters
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-secondary product-catalog-clear-btn"
              >
                Clear Filters
              </button>
            </div>
          </form>
        </aside>

        {/* Product Grid */}
        <div className="product-catalog-main-content">
          {products.length === 0 ? (
            <div className="product-catalog-empty-state">
              <Package className="product-catalog-empty-icon" />
              <h3 className="product-catalog-empty-title">No products found</h3>
              <p className="product-catalog-empty-message">
                Adjust your filters or search terms.
              </p>
            </div>
          ) : (
            <div className="product-catalog-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

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
    </div>
  );
};

export default ProductCatalogPage;
