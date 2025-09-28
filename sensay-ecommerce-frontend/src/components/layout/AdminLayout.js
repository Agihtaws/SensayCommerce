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
  const sidebarRef = useRef(null); // Ref for sidebar to handle clicks

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

  // Fetch Sensay Balance
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

  // Handle Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Check if current path matches navigation item
  const isCurrentPath = (path) => {
    return location.pathname.startsWith(path);
  };

  // Toggle Admin User Dropdown Menu
  const toggleAdminMenu = () => {
    setAdminMenuOpen(prev => !prev);
  };

  // Close admin user menu when clicking outside
  useEffect(() => {
    const handleClickOutsideAdminMenu = (event) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setAdminMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideAdminMenu);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideAdminMenu);
    };
  }, [adminMenuRef]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutsideSidebar = (event) => {
      // Only close if sidebar is open AND click is outside the sidebar itself
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideSidebar);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideSidebar);
    };
  }, [sidebarOpen, sidebarRef]);


  return (
    <div className="admin-layout">
      {/* Mobile sidebar overlay - appears only when sidebar is open */}
      {sidebarOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Desktop & Mobile Sidebar */}
      <div ref={sidebarRef} className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Mobile sidebar close button */}
        {sidebarOpen && (
          <button className="mobile-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        )}
        
        <div className="admin-sidebar-header">
          <Link to="/admin/dashboard" className="admin-logo" onClick={() => setSidebarOpen(false)}>
            <div className="admin-logo-icon">
              <LayoutDashboard size={20} color="white" />
            </div>
            <span className="admin-logo-text">Sensay Admin</span>
          </Link>
        </div>
        
        <nav className="admin-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link // Using Link for proper navigation
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)} // Close sidebar on mobile after navigation
                className={`admin-nav-item ${isCurrentPath(item.href) ? 'active' : ''}`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
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
                  <Link to="/admin/dashboard" className="admin-dropdown-item" onClick={() => setAdminMenuOpen(false)}>
                    <LayoutDashboard size={16} /> Admin Panel
                  </Link>
                  <Link to="/admin/settings" className="admin-dropdown-item" onClick={() => setAdminMenuOpen(false)}>
                    <Settings size={16} /> Settings
                  </Link>
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
