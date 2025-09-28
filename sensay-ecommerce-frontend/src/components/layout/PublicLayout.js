import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingCart, 
  Heart, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Search, 
  Coins, 
  Menu,
  X,
  Settings, // Added for dropdown
  ClipboardList // Added for dropdown
} from 'lucide-react';
import toast from 'react-hot-toast';
import ChatWidget from '../customer/ChatWidget';
import '../../styles/PublicLayout.css';

const PublicLayout = () => {
  const { isAuthenticated, user, logout, sensayBalance } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false); // State for user dropdown
  const userMenuRef = useRef(null); // Ref for click-outside detection

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(prev => !prev);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuRef]);

  // Close mobile menu if user menu is opened
  useEffect(() => {
    if (userMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [userMenuOpen]);


  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="public-header-container">
          <div className="public-header-content">
            <div className="public-header-left">
              <Link to="/" className="public-logo">
                <div className="public-logo-icon">
                  <ShoppingCart size={20} color="white" />
                </div>
                <span className="public-logo-text">Sensay Shop</span>
              </Link>
              
              <nav className="public-nav">
                <Link to="/products" className="public-nav-link">Products</Link>
                <Link to="/categories" className="public-nav-link">Categories</Link>
                <Link to="/about" className="public-nav-link">About</Link>
              </nav>
            </div>

            <div className="public-header-actions">
              

              <button className="public-action-btn" onClick={() => navigate('/wishlist')}>
                <Heart size={20} />
              </button>
              
              <button className="public-action-btn" onClick={() => navigate('/cart')}>
                <ShoppingCart size={20} />
              </button>

              {isAuthenticated && user?.role === 'customer' && (
                <div className="public-balance">
                  <Coins size={16} />
                  <span className="public-balance-amount">{sensayBalance?.toLocaleString() || 0} units</span>
                </div>
              )}

              {isAuthenticated ? (
                <div className="public-user-dropdown-container" ref={userMenuRef}>
                  <button onClick={toggleUserMenu} className="public-user-menu-toggle">
                    <div className="public-user-avatar">
                      {user?.firstName?.charAt(0) || 'U'}
                    </div>
                    <span className="public-user-name">
                      {user?.firstName}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="public-user-dropdown-menu">
                      {user?.role === 'customer' && (
                        <>
                          <Link to="/dashboard" className="public-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                            <LayoutDashboard size={16} /> Dashboard
                          </Link>
                          <Link to="/orders" className="public-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                            <ClipboardList size={16} /> Orders
                          </Link>
                          <Link to="/profile" className="public-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                            <User size={16} /> Profile
                          </Link>
                          
                        </>
                      )}
                      {user?.role === 'admin' && (
                        <>
                          <Link to="/admin/dashboard" className="public-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                            <LayoutDashboard size={16} /> Admin Panel
                          </Link>
                          <Link to="/admin/settings" className="public-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                            <Settings size={16} /> Settings
                          </Link>
                        </>
                      )}
                      <button onClick={handleLogout} className="public-dropdown-item logout-item">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  <User size={16} />
                  <span className="login-text">Login</span>
                </Link>
              )}

              <button 
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(prev => !prev)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="mobile-menu">
              <div className="mobile-menu-content">
                <Link to="/products" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Products
                </Link>
                <Link to="/categories" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Categories
                </Link>
                <Link to="/about" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  About
                </Link>
                
                {isAuthenticated && user?.role === 'customer' && (
                  <div className="mobile-balance">
                    <Coins size={16} />
                    <span className="public-balance-amount">{sensayBalance?.toLocaleString() || 0} units</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="public-footer-container">
          <div className="public-footer-grid">
            <div className="public-footer-section">
              <div className="footer-logo">
                <div className="public-logo-icon">
                  <ShoppingCart size={20} color="white" />
                </div>
                <span className="public-logo-text">Sensay Shop</span>
              </div>
              <p>Your ultimate destination for AI-powered e-commerce. Discover amazing products with intelligent recommendations.</p>
            </div>
            
            <div className="public-footer-section">
              <h3>Quick Links</h3>
              <ul className="public-footer-links">
                <li><Link to="/products">Products</Link></li>
                <li><Link to="/categories">Categories</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            
            <div className="public-footer-section">
              <h3>Support</h3>
              <ul className="public-footer-links">
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/shipping">Shipping Info</Link></li>
                <li><Link to="/returns">Returns</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="public-footer-bottom">
            &copy; {new Date().getFullYear()} Sensay Shop. All rights reserved. Powered by AI.
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
};

export default PublicLayout;
