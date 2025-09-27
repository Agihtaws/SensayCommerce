import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import PublicLayout from './components/layout/PublicLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductList from './pages/admin/ProductList';
import NewProductPage from './pages/admin/NewProductPage';
import EditProductPage from './pages/admin/EditProductPage';
import HomePage from './pages/customer/HomePage';
import ProductCatalogPage from './pages/customer/ProductCatalogPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import WishlistPage from './pages/customer/WishlistPage';
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import ProfilePage from './pages/customer/ProfilePage';
import AdminOrderListPage from './pages/admin/AdminOrderListPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminCustomerListPage from './pages/admin/AdminCustomerListPage';
import AdminCustomerDetailPage from './pages/admin/AdminCustomerDetailPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import CategoriesPage from './pages/customer/CategoriesPage';
import AboutPage from './pages/customer/AboutPage';
import AdminKnowledgeBasePage from './pages/admin/AdminKnowledgeBasePage'; // NEW

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Public Customer Routes (with PublicLayout) */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductCatalogPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="cart" element={
                <ProtectedRoute requireCustomer={true}>
                  <CartPage />
                </ProtectedRoute>
              } />
              <Route path="wishlist" element={
                <ProtectedRoute requireCustomer={true}>
                  <WishlistPage />
                </ProtectedRoute>
              } />
              <Route path="dashboard" element={
                <ProtectedRoute requireCustomer={true}>
                  <CustomerDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="orders" element={
                <ProtectedRoute requireCustomer={true}>
                  <OrderHistoryPage />
                </ProtectedRoute>
              } />
              <Route path="orders/:orderNumber" element={
                <ProtectedRoute requireCustomer={true}>
                  <OrderDetailPage />
                </ProtectedRoute>
              } />
              <Route path="checkout" element={
                <ProtectedRoute requireCustomer={true}>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute requireCustomer={true}>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              {/* Other public routes will go here */}
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<NewProductPage />} />
              <Route path="products/edit/:id" element={<EditProductPage />} />
              <Route path="orders" element={<AdminOrderListPage />} />
              <Route path="orders/:orderNumber" element={<AdminOrderDetailPage />} />
              <Route path="customers" element={<AdminCustomerListPage />} />
              <Route path="customers/:id" element={<AdminCustomerDetailPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="knowledge-base" element={<AdminKnowledgeBasePage />} /> {/* NEW */}
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
            
            {/* Catch all route - redirects to home or login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
