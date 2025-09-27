import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import Loading from '../../components/common/Loading';
import { ShoppingCart, Heart, Package, Star, Plus, Minus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import cartService from '../../services/cartService';
import wishlistService from '../../services/wishlistService';
import '../../styles/ProductDetailPage.css'; // Import the custom CSS

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProduct(id);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0].url);
        }
      } catch (error) {
        toast.error(error.message);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity((prev) => Math.min(prev + 1, product.stock));
    } else if (type === 'decrease') {
      setQuantity((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated || !isCustomer()) {
      toast.error('Please login as a customer to add items to cart.');
      navigate('/login');
      return;
    }
    try {
      await cartService.addItem(product._id, quantity);
      toast.success(`${quantity} x ${product.name} added to cart!`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated || !isCustomer()) {
      toast.error('Please login as a customer to add items to wishlist.');
      navigate('/login');
      return;
    }
    try {
      await wishlistService.addItem(product._id);
      toast.success(`${product.name} added to wishlist!`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <Loading text="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="product-detail-not-found-container">
        <AlertCircle className="product-not-found-icon" />
        <h3 className="product-not-found-title">Product not found</h3>
        <p className="product-not-found-message">
          The product you are looking for does not exist or is unavailable.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="btn btn-primary"
        >
          Browse All Products
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-page-container">
      <div className="product-detail-layout-grid">
        {/* Product Image Gallery */}
        <div className="product-image-gallery">
          <div className="product-thumbnail-grid">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setMainImage(image.url)}
                className={`product-thumbnail-button ${
                  mainImage === image.url ? 'active' : ''
                }`}
              >
                <span className="sr-only"> {product.name} image {index + 1}</span>
                <span className="product-thumbnail-image-wrapper">
                  <img src={image.url} alt={image.alt} className="product-thumbnail-image" />
                </span>
              </button>
            ))}
          </div>

          <div className="product-main-image-wrapper">
            <img
              src={mainImage || (product.images[0]?.url || 'https://via.placeholder.com/600x400?text=No+Image')}
              alt={product.name}
              className="product-main-image"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <h1 className="product-title">
            {product.name}
          </h1>

          <div className="product-price-display">
            <p className="product-current-price">USD {product.price.toFixed(2)}</p>
            {product.discount > 0 && product.originalPrice && (
              <p className="product-discount-info">
                {product.discount}% off <span className="product-original-price">USD {product.originalPrice.toFixed(2)}</span>
              </p>
            )}
          </div>

          {/* Reviews (Placeholder) */}
          <div className="product-reviews-section">
            <h3 className="sr-only">Reviews</h3>
            <div className="product-reviews-summary">
              <div className="product-star-rating">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <Star
                    key={rating}
                    className={`star-icon ${
                      (product.rating?.average || 0) > rating ? 'filled' : 'empty'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="sr-only">{product.rating?.average || 0} out of 5 stars</p>
              <a href="#" className="product-reviews-link">
                {(product.rating?.count || 0)} reviews
              </a>
            </div>
          </div>

          <div className="product-description-section">
            <h3 className="sr-only">Description</h3>
            <div className="product-description-text">
              <p>{product.description}</p>
            </div>
          </div>

          <div className="product-meta-info">
            <p className="product-meta-item">
              Brand: <span className="product-meta-value">{product.brand}</span>
            </p>
            <p className="product-meta-item">
              Category: <span className="product-meta-value">{product.category}</span>
            </p>
            <p className="product-meta-item">
              SKU: <span className="product-meta-value">{product.sku}</span>
            </p>
            <p className="product-meta-item">
              Availability: <span className={`product-availability ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
              </span>
            </p>
          </div>

          <div className="product-quantity-selector">
            <h3 className="product-quantity-title">Quantity</h3>
            <div className="quantity-controls">
              <button
                type="button"
                onClick={() => handleQuantityChange('decrease')}
                disabled={quantity <= 1 || product.stock === 0}
                className="quantity-btn"
              >
                <Minus className="quantity-icon" />
              </button>
              <span className="quantity-display">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange('increase')}
                disabled={quantity >= product.stock}
                className="quantity-btn"
              >
                <Plus className="quantity-icon" />
              </button>
            </div>
          </div>

          <form className="product-actions-form">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn btn-primary add-to-cart-btn"
            >
              <ShoppingCart className="btn-icon" />
              Add to cart
            </button>
            <button
              type="button"
              onClick={handleAddToWishlist}
              className="btn btn-secondary add-to-wishlist-btn"
            >
              <Heart className="btn-icon" />
              Add to Wishlist
            </button>
          </form>

          {/* Product Specifications Section */}
          {Object.keys(product.specifications).length > 0 && (
            <div className="product-specifications-section">
              <h3 className="product-specifications-title">Specifications</h3>
              <div className="product-specifications-list">
                <ul>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <li key={key} className="product-specification-item">
                      <span className="spec-key">{key}</span>
                      <span className="spec-value">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Product Tags Section */}
          {product.tags && product.tags.length > 0 && (
            <div className="product-tags-section">
              <h3 className="product-tags-title">Tags</h3>
              <div className="product-tags-list">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="product-tag"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
