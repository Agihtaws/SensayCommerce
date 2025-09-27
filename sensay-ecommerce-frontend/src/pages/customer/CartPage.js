import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import cartService from '../../services/cartService';
import Loading from '../../components/common/Loading';
import { Trash2, Plus, Minus, ShoppingCart, DollarSign, Truck, Percent } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/CartPage.css';


const CartPage = () => {
  const { isAuthenticated, isCustomer, user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !isCustomer()) {
      toast.error('Please login as a customer to view your cart.');
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, isCustomer, navigate]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      toast.error(error.message);
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, currentQuantity, type) => {
    const newQuantity = type === 'increase' ? currentQuantity + 1 : currentQuantity - 1;
    if (newQuantity < 1) return;

    setUpdatingItemId(productId);
    try {
      await cartService.updateItemQuantity(productId, newQuantity);
      await fetchCart(); // Re-fetch to update totals
      toast.success('Cart updated!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from your cart?`)) {
      return;
    }
    setUpdatingItemId(productId);
    try {
      await cartService.removeItem(productId);
      await fetchCart(); // Re-fetch to update totals
      toast.success(`${productName} removed from cart.`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }
    setLoading(true);
    try {
      await cartService.clearCart();
      await fetchCart(); // Re-fetch empty cart
      toast.success('Your cart has been cleared.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty. Please add items before checking out.');
      return;
    }
    navigate('/checkout'); // Navigate to the checkout page (will be built in next phase)
  };

  if (loading) {
    return <Loading text="Loading your cart..." />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-empty-container">
        <ShoppingCart className="cart-empty-icon" />
        <h3 className="cart-empty-title">Your cart is empty</h3>
        <p className="cart-empty-message">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link to="/products" className="btn btn-primary cart-empty-btn">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-page-title">Shopping Cart</h1>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items-section">
          <div className="cart-items-list">
            {cart.items.map((item) => (
              <div key={item.productId._id} className="cart-item">
                <div className="cart-item-image">
                  <img
                    src={item.productId.images?.[0]?.url || 'https://via.placeholder.com/150?text=No+Image'}
                    alt={item.productId.name}
                  />
                </div>

                <div className="cart-item-details">
                  <div className="cart-item-header">
                    <h3 className="cart-item-name">
                      <Link to={`/products/${item.productId._id}`} className="cart-item-link">
                        {item.productId.name}
                      </Link>
                    </h3>
                    <p className="cart-item-price">USD {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <p className="cart-item-brand">{item.productId.brand}</p>
                  
                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button
                        onClick={() => handleUpdateQuantity(item.productId._id, item.quantity, 'decrease')}
                        disabled={item.quantity <= 1 || updatingItemId === item.productId._id}
                        className="quantity-btn"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.productId._id, item.quantity, 'increase')}
                        disabled={item.quantity >= item.productId.stock || updatingItemId === item.productId._id}
                        className="quantity-btn"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.productId._id, item.productId.name)}
                      disabled={updatingItemId === item.productId._id}
                      className="remove-item-btn"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-actions">
            <button onClick={handleClearCart} className="btn btn-secondary clear-cart-btn">
              <Trash2 size={16} />
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2 className="order-summary-title">Order Summary</h2>
          
          <div className="order-summary-details">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>USD {cart.subtotal.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">
                <Percent size={16} />
                Tax (8%)
              </span>
              <span>USD {cart.tax.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">
                <Truck size={16} />
                Shipping
              </span>
              <span>{cart.shipping === 0 ? 'Free' : `USD ${cart.shipping.toFixed(2)}`}</span>
            </div>
            
            <div className="summary-total">
              <span>Order Total</span>
              <span>USD {cart.total.toFixed(2)}</span>
            </div>
          </div>
          
          <button onClick={handleCheckout} className="btn btn-primary checkout-btn">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
