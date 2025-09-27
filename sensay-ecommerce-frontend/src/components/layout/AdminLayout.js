import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Coins,
  ClipboardList,
  BookOpen,
  User as UserIcon 
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import '../../styles/AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [realSensayBalance, setRealSensayBalance] = useState(0);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false); 
  const adminMenuRef = useRef(null); 

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ClipboardList },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Knowledge Base', href: '/admin/knowledge-base', icon: BookOpen },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  useEffect(() => {
    const fetchSensayBalance = async () => {
      try {
        const response = await api.get('/sensay-balance');
        setRealSensayBalance(response.data.data.currentBalance || 0);
      } catch (error) {
        console.error('Failed to fetch Sensay balance:', error);
        setRealSensayBalance(0);
      }
    };

    fetchSensayBalance();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const isCurrentPath = (path) => {
    return location.pathname.startsWith(path);
  };

  const toggleAdminMenu = () => {
    setAdminMenuOpen(prev => !prev);
  };

  // Close admin menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setAdminMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [adminMenuRef]);


  return (
    <div className="admin-layout">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <div className={`mobile-sidebar ${sidebarOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button className="mobile-sidebar-close" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
            
            <div className="admin-sidebar-header">
              <div className="admin-logo">
                <div className="admin-logo-icon">
                  <LayoutDashboard size={20} color="white" />
                </div>
                <span className="admin-logo-text">Sensay Admin</span>
              </div>
            </div>
            
            <nav className="admin-nav">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.href);
                      setSidebarOpen(false);
                    }}
                    className={`admin-nav-item ${isCurrentPath(item.href) ? 'active' : ''}`}
                  >
                    <Icon size={20} />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <div className="admin-logo-icon">
              <LayoutDashboard size={20} color="white" />
            </div>
            <span className="admin-logo-text">Sensay Admin</span>
          </div>
        </div>
        
        <nav className="admin-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`admin-nav-item ${isCurrentPath(item.href) ? 'active' : ''}`}
              >
                <Icon size={20} />
                {item.name}
              </button>
            );
          })}
        </nav>
        
        <div className="admin-balance">
          <div className="admin-balance-content">
            <div className="admin-balance-icon">
              <Coins size={16} color="white" />
            </div>
            <div className="admin-balance-info">
              <div className="admin-balance-label">Sensay Balance</div>
              <div className="admin-balance-amount">{realSensayBalance?.toLocaleString() || 0} units</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          
          <h1 className="admin-header-title">
            {navigation.find(item => location.pathname.startsWith(item.href))?.name || 'Admin Panel'}
          </h1>
          
          <div className="admin-header-actions">
            <div className="admin-user-dropdown-container" ref={adminMenuRef}>
              {/* This entire button is the toggle for the dropdown */}
              <button onClick={toggleAdminMenu} className="admin-user-menu-toggle">
                <div className="admin-user-avatar">
                  {user?.firstName?.charAt(0) || 'A'}
                </div>
                <div className="admin-user-info-text">
                  <div className="admin-user-name">{user?.firstName} {user?.lastName}</div>
                  <div className="admin-user-email">{user?.email}</div>
                </div>
              </button>

              {adminMenuOpen && (
                <div className="admin-user-dropdown-menu">
                  {/* Admin Panel link */}
                  <Link to="/admin/dashboard" className="admin-dropdown-item" onClick={() => setAdminMenuOpen(false)}>
                    <LayoutDashboard size={16} /> Admin Panel
                  </Link>
                  {/* Settings link */}
                  <Link to="/admin/settings" className="admin-dropdown-item" onClick={() => setAdminMenuOpen(false)}>
                    <Settings size={16} /> Settings
                  </Link>
                  {/* Logout button */}
                  <button onClick={handleLogout} className="admin-dropdown-item logout-item">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
