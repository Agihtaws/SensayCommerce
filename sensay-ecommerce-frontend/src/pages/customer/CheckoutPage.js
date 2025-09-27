import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import cartService from '../../services/cartService';
import orderService from '../../services/orderService';
import Loading from '../../components/common/Loading';
import {
  ShoppingCart,
  DollarSign,
  Truck,
  Percent,
  MapPin,
  CreditCard,
  Clipboard,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/CheckoutPage.css';

const CheckoutPage = () => {
  const { isAuthenticated, isCustomer, user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || '',
    phone: user?.phone || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isCustomer()) {
      toast.error('Please login as a customer to proceed to checkout.');
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, isCustomer, navigate]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      if (!data || data.items.length === 0) {
        toast.error('Your cart is empty. Redirecting to cart.');
        navigate('/cart');
        return;
      }
      setCart(data);
    } catch (error) {
      toast.error(error.message);
      console.error('Failed to fetch cart for checkout:', error);
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const validateAddress = () => {
    if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode || !shippingAddress.country || !shippingAddress.phone) {
      toast.error('Please fill in all required shipping address fields.');
      return false;
    }
    return true;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateAddress()) {
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        shippingAddress,
        paymentMethod,
        notes,
      };
      const newOrder = await orderService.createOrder(orderData);
      toast.success('Order placed successfully!');
      navigate(`/orders/${newOrder.orderNumber}`); // Redirect to order detail page
    } catch (error) {
      toast.error(error.message);
      console.error('Failed to place order:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading text="Loading checkout details..." />;
  }

  if (!cart) {
    return null; // Should redirect to cart if empty
  }

  return (
    <div className="checkout-page-container">
      <h1 className="checkout-page-title">Checkout</h1>

      <form onSubmit={handleSubmitOrder} className="checkout-layout-grid">
        {/* Shipping Address */}
        <div className="checkout-shipping-address-section">
          <h2 className="checkout-section-title">
            <MapPin className="checkout-section-icon" />
            Shipping Address
          </h2>
          <div className="checkout-form-grid-2">
            <div>
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input type="text" name="firstName" id="firstName" value={shippingAddress.firstName} onChange={handleAddressChange} required className="form-input checkout-input" />
            </div>
            <div>
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input type="text" name="lastName" id="lastName" value={shippingAddress.lastName} onChange={handleAddressChange} required className="form-input checkout-input" />
            </div>
            <div className="checkout-full-width">
              <label htmlFor="street" className="form-label">Street Address</label>
              <input type="text" name="street" id="street" value={shippingAddress.street} onChange={handleAddressChange} required className="form-input checkout-input" />
            </div>
            <div>
              <label htmlFor="city" className="form-label">City</label>
              <input type="text" name="city" id="city" value={shippingAddress.city} onChange={handleAddressChange} required className="form-input checkout-input" />
            </div>
            <div>
              <label htmlFor="state" className="form-label">State / Province</label>
              <input type="text" name="state" id="state" value={shippingAddress.state} onChange={handleAddressChange} className="form-input checkout-input" />
            </div>
            <div>
              <label htmlFor="zipCode" className="form-label">ZIP / Postal Code</label>
              <input type="text" name="zipCode" id="zipCode" value={shippingAddress.zipCode} onChange={handleAddressChange} required className="form-input checkout-input" />
            </div>
            <div>
              <label htmlFor="country" className="form-label">Country</label>
              <input type="text" name="country" id="country" value={shippingAddress.country} onChange={handleAddressChange} required className="form-input checkout-input" />
            </div>
            <div>
              <label htmlFor="phone" className="form-label">Phone</label>
              <input type="tel" name="phone" id="phone" value={shippingAddress.phone} onChange={handleAddressChange} required className="form-input checkout-input" />
            </div>
          </div>

          <div className="checkout-payment-method-section">
            <h2 className="checkout-section-title">
              <CreditCard className="checkout-section-icon" />
              Payment Method
            </h2>
            <div className="checkout-payment-options">
              <div className="checkout-radio-option">
                <input
                  id="credit_card"
                  name="paymentMethod"
                  type="radio"
                  value="credit_card"
                  checked={paymentMethod === 'credit_card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="checkout-radio-input"
                />
                <label htmlFor="credit_card" className="checkout-radio-label">Credit/Debit Card (Simulated)</label>
              </div>
              <div className="checkout-radio-option">
                <input
                  id="paypal"
                  name="paymentMethod"
                  type="radio"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="checkout-radio-input"
                />
                <label htmlFor="paypal" className="checkout-radio-label">PayPal (Simulated)</label>
              </div>
            </div>
          </div>

          <div className="checkout-order-notes-section">
            <h2 className="checkout-section-title">
              <Clipboard className="checkout-section-icon" />
              Order Notes (Optional)
            </h2>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-textarea checkout-textarea"
              placeholder="Any special instructions or delivery preferences?"
            ></textarea>
          </div>
        </div>

        {/* Order Summary */}
        <div className="checkout-order-summary-sidebar">
          <h2 className="checkout-section-title">Order Summary</h2>
          <div className="checkout-summary-details">
            <div className="checkout-summary-row">
              <p>Subtotal ({cart.items.length} items)</p>
              <p>USD {cart.subtotal.toFixed(2)}</p>
            </div>
            <div className="checkout-summary-row">
              <p className="checkout-summary-label-with-icon">
                <Percent className="checkout-summary-icon" />
                Tax (8%)
              </p>
              <p>USD {cart.tax.toFixed(2)}</p>
            </div>
            <div className="checkout-summary-row">
              <p className="checkout-summary-label-with-icon">
                <Truck className="checkout-summary-icon" />
                Shipping
              </p>
              <p>{cart.shipping === 0 ? 'Free' : `USD ${cart.shipping.toFixed(2)}`}</p>
            </div>
            <div className="checkout-total-row">
              <p>Order Total</p>
              <p>USD {cart.total.toFixed(2)}</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary checkout-place-order-btn"
          >
            {submitting ? (
              <div className="loading-spinner loading-small"></div>
            ) : (
              `Place Order - USD ${cart.total.toFixed(2)}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
