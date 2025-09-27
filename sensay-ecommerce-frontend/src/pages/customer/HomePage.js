import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import Loading from '../../components/common/Loading';
import { Package, DollarSign, ShoppingCart, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import cartService from '../../services/cartService'; // Will create this later
import wishlistService from '../../services/wishlistService'; // Will create this later
import '../../styles/HomePage.css'; // Import the custom CSS

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const featuredData = await productService.getProducts({ limit: 4, isFeatured: true });
        setFeaturedProducts(featuredData.products);

        const latestData = await productService.getProducts({ limit: 4, sort: 'newest' });
        setLatestProducts(latestData.products);
      } catch (error) {
        toast.error('Failed to load products');
        console.error('Failed to fetch products for homepage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId, productName) => {
    if (!isAuthenticated || !isCustomer()) {
      toast.error('Please login as a customer to add items to cart.');
      navigate('/login');
      return;
    }
    try {
      await cartService.addItem(productId, 1);
      toast.success(`${productName} added to cart!`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddToWishlist = async (productId, productName) => {
    if (!isAuthenticated || !isCustomer()) {
      toast.error('Please login as a customer to add items to wishlist.');
      navigate('/login');
      return;
    }
    try {
      await wishlistService.addItem(productId);
      toast.success(`${productName} added to wishlist!`);
    } catch (error) {
      toast.error(error.message);
    }
  };


  if (loading) {
    return <Loading text="Loading products..." />;
  }

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Discover the Future of E-commerce with Sensay AI
          </h1>
          <p className="hero-subtitle">
            Experience personalized shopping, intelligent product recommendations, and instant support powered by our advanced AI assistant.
          </p>
          <Link
            to="/products"
            className="btn btn-primary hero-shop-btn"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section">
        <div className="products-container">
          <h2 className="products-section-title">Featured Products</h2>
          {featuredProducts.length === 0 ? (
            <div className="products-empty-state">No featured products available.</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <Link to={`/products/${product._id}`} className="product-image-link">
                    {product.images && product.images.length > 0 ? (
                      <img
                        className="product-image"
                        src={product.images[0].url}
                        alt={product.name}
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <Package className="product-placeholder-icon" />
                      </div>
                    )}
                  </Link>
                  <div className="product-card-content">
                    <h3 className="product-card-title">
                      <Link to={`/products/${product._id}`} className="product-card-title-link">{product.name}</Link>
                    </h3>
                    <p className="product-card-description">{product.description}</p>
                    <div className="product-card-footer">
                      <p className="product-card-price">
                        USD {product.price.toFixed(2)}
                      </p>
                      <div className="product-card-actions">
                        <button
                          onClick={() => handleAddToWishlist(product._id, product.name)}
                          className="product-action-btn wishlist-btn"
                          title="Add to Wishlist"
                        >
                          <Heart className="product-action-icon" />
                        </button>
                        <button
                          onClick={() => handleAddToCart(product._id, product.name)}
                          className="product-action-btn cart-btn"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="product-action-icon" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Products */}
      <section className="products-section latest-products-section">
        <div className="products-container">
          <h2 className="products-section-title">Latest Arrivals</h2>
          {latestProducts.length === 0 ? (
            <div className="products-empty-state">No new products available.</div>
          ) : (
            <div className="products-grid">
              {latestProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <Link to={`/products/${product._id}`} className="product-image-link">
                    {product.images && product.images.length > 0 ? (
                      <img
                        className="product-image"
                        src={product.images[0].url}
                        alt={product.name}
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <Package className="product-placeholder-icon" />
                      </div>
                    )}
                  </Link>
                  <div className="product-card-content">
                    <h3 className="product-card-title">
                      <Link to={`/products/${product._id}`} className="product-card-title-link">{product.name}</Link>
                    </h3>
                    <p className="product-card-description">{product.description}</p>
                    <div className="product-card-footer">
                      <p className="product-card-price">
                        USD {product.price.toFixed(2)}
                      </p>
                      <div className="product-card-actions">
                        <button
                          onClick={() => handleAddToWishlist(product._id, product.name)}
                          className="product-action-btn wishlist-btn"
                          title="Add to Wishlist"
                        >
                          <Heart className="product-action-icon" />
                        </button>
                        <button
                          onClick={() => handleAddToCart(product._id, product.name)}
                          className="product-action-btn cart-btn"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="product-action-icon" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
