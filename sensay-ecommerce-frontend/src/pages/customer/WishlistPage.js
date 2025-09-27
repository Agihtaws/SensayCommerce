import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import wishlistService from '../../services/wishlistService';
import cartService from '../../services/cartService';
import Loading from '../../components/common/Loading';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/WishlistPage.css';

const WishlistPage = () => {
  const { isAuthenticated, isCustomer, user } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !isCustomer()) {
      toast.error('Please login as a customer to view your wishlist.');
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, isCustomer, navigate]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data);
    } catch (error) {
      toast.error(error.message);
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from your wishlist?`)) {
      return;
    }
    setUpdatingItemId(productId);
    try {
      await wishlistService.removeItem(productId);
      await fetchWishlist();
      toast.success(`${productName} removed from wishlist.`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleMoveToCart = async (productId, productName) => {
    setUpdatingItemId(productId);
    try {
      await cartService.addItem(productId, 1); // Add 1 quantity to cart
      await wishlistService.removeItem(productId); // Remove from wishlist
      await fetchWishlist(); // Refresh wishlist
      toast.success(`${productName} moved to cart!`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearWishlist = async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }
    setLoading(true);
    try {
      await wishlistService.clearWishlist();
      await fetchWishlist();
      toast.success('Your wishlist has been cleared.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading your wishlist..." />;
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="wishlist-empty-container">
        <Heart className="wishlist-empty-icon" />
        <h3 className="wishlist-empty-title">Your wishlist is empty</h3>
        <p className="wishlist-empty-message">
          Save your favorite products here to easily find them later.
        </p>
        <Link to="/products" className="btn btn-primary wishlist-empty-btn">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <h1 className="wishlist-page-title">My Wishlist</h1>

      <div className="wishlist-container">
        <div className="wishlist-items-list">
          {wishlist.items.map((item) => (
            <div key={item.productId._id} className="wishlist-item">
              <div className="wishlist-item-image">
                <img
                  src={item.productId.images?.[0]?.url || 'https://via.placeholder.com/150?text=No+Image'}
                  alt={item.productId.name}
                />
              </div>

              <div className="wishlist-item-details">
                <div className="wishlist-item-header">
                  <h3 className="wishlist-item-name">
                    <Link to={`/products/${item.productId._id}`} className="wishlist-item-link">
                      {item.productId.name}
                    </Link>
                  </h3>
                  <p className="wishlist-item-price">USD {item.productId.price.toFixed(2)}</p>
                </div>
                
                <p className="wishlist-item-brand">{item.productId.brand}</p>
                
                <div className="wishlist-item-info">
                  <p className="wishlist-item-stock">
                    Stock: {item.productId.stock}
                    {item.productId.stock === 0 && <span className="out-of-stock-badge">Out of Stock</span>}
                  </p>
                </div>

                <div className="wishlist-item-actions">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(item.productId._id, item.productId.name)}
                    disabled={item.productId.stock === 0 || updatingItemId === item.productId._id}
                    className="btn btn-primary move-to-cart-btn"
                  >
                    <ShoppingCart size={16} />
                    Move to Cart
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.productId._id, item.productId.name)}
                    disabled={updatingItemId === item.productId._id}
                    className="btn btn-danger remove-item-btn"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="wishlist-actions">
          <button
            onClick={handleClearWishlist}
            className="btn btn-secondary clear-wishlist-btn"
          >
            <Trash2 size={16} />
            Clear Wishlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
