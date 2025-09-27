import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import cartService from '../../services/cartService';
import wishlistService from '../../services/wishlistService';
import '../../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const { isAuthenticated, isCustomer } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !isCustomer()) {
      toast.error('Please login as a customer to add items to cart.');
      navigate('/login');
      return;
    }
    try {
      await cartService.addItem(product._id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
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

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-image-link">
        {product.images && product.images.length > 0 ? (
          <img
            className="product-image"
            src={product.images[0].url}
            alt={product.name}
          />
        ) : (
          <div className="product-image-placeholder">
            <Package size={64} />
          </div>
        )}
      </Link>
      <div className="product-content">
        <h3 className="product-title">
          <Link to={`/products/${product._id}`} className="product-title-link">{product.name}</Link>
        </h3>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <p className="product-price">
            USD {product.price.toFixed(2)}
          </p>
          <div className="product-actions">
            <button
              onClick={handleAddToWishlist}
              className="product-action-btn wishlist-btn"
              title="Add to Wishlist"
            >
              <Heart size={20} />
            </button>
            <button
              onClick={handleAddToCart}
              className="product-action-btn cart-btn"
              title="Add to Cart"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
