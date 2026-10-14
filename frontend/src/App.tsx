import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Wishlist from './pages/Wishlist';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import { useAuthStore } from './store/useAuthStore';

// Admin Imports
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNewsletter from './pages/admin/AdminNewsletter';

// Customer Storefront Layout Wrapper
const CustomerLayout = () => (
  <div className="min-h-screen flex flex-col font-body bg-brand-light text-gray-900 selection:bg-brand-primary selection:text-white">
    <Navbar />
    
    <main className="flex-1 flex flex-col">
      <Outlet />
    </main>
    
    <Footer />

    {/* Global Auth Modal for Customer Login / Account Creation */}
    <AuthModal />

    {/* Global Slide-over Shopping Bag Drawer */}
    <CartDrawer />
  </div>
);

// Placeholder for other pages to avoid errors
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh] px-4 text-center">
    <h1 className="text-2xl sm:text-3xl font-heading text-gray-800">{title}</h1>
  </div>
);

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
        {/* Isolated Executive Admin Portal */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
        </Route>

        {/* Customer Storefront Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
          <Route path="/about" element={<PlaceholderPage title="About Us (Coming Soon)" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
