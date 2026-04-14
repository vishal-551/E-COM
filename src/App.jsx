import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import { AboutPage, AccountPage, CartPage, CheckoutPage, ContactPage, FAQPage, LoginPage, MyOrdersPage, NotFoundPage, PolicyPage, SignupPage, TrackingPage, WishlistPage } from './pages/UtilityPages';
import { AdminBanners, AdminCategories, AdminCoupons, AdminDashboard, AdminEnquiries, AdminLoginPage, AdminOrders, AdminProducts, AdminReviews, AdminSettings, AdminUsers } from './pages/admin/AdminPages';
import { useStore } from './context/StoreContext';

const Collection = ({ title, filter }) => <Layout><div className="py-8"><h1 className="section-title mb-4">{title}</h1><ShopPage preset={filter} /></div></Layout>;

const AdminRoute = ({ children }) => {
  const { loading, user, isAdmin } = useStore();
  if (loading) return <Layout><div className="py-8">Authorizing...</div></Layout>;
  return user && isAdmin ? children : <Navigate to="/admin/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/shop" element={<Layout><ShopPage /></Layout>} />
      <Route path="/categories" element={<Collection title="Categories" />} />
      <Route path="/new-arrivals" element={<Collection title="New Arrivals" />} />
      <Route path="/best-sellers" element={<Collection title="Best Sellers" filter={(p) => p.featured} />} />
      <Route path="/bridal-collection" element={<Collection title="Bridal Collection" />} />
      <Route path="/daily-wear-collection" element={<Collection title="Daily Wear Collection" />} />
      <Route path="/party-wear-collection" element={<Collection title="Party Wear Collection" />} />
      <Route path="/festival-collection" element={<Collection title="Festival Collection" />} />
      <Route path="/offers" element={<Collection title="Offers & Sale" filter={(p) => Number(p.sale_price) > 0} />} />
      <Route path="/product/:slug" element={<Layout><ProductPage /></Layout>} />
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
      <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
      <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
      <Route path="/cart" element={<Layout><CartPage /></Layout>} />
      <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
      <Route path="/login" element={<Layout><LoginPage /></Layout>} />
      <Route path="/signup" element={<Layout><SignupPage /></Layout>} />
      <Route path="/profile" element={<Layout><AccountPage /></Layout>} />
      <Route path="/account" element={<Navigate to="/profile" replace />} />
      <Route path="/orders" element={<Layout><MyOrdersPage /></Layout>} />
      <Route path="/my-orders" element={<Navigate to="/orders" replace />} />
      <Route path="/order-tracking" element={<Layout><TrackingPage /></Layout>} />
      <Route path="/privacy-policy" element={<Layout><PolicyPage title="Privacy Policy" /></Layout>} />
      <Route path="/terms-and-conditions" element={<Layout><PolicyPage title="Terms and Conditions" /></Layout>} />
      <Route path="/shipping-policy" element={<Layout><PolicyPage title="Shipping Policy" /></Layout>} />
      <Route path="/return-and-exchange-policy" element={<Layout><PolicyPage title="Return and Exchange Policy" /></Layout>} />
      <Route path="/cancellation-policy" element={<Layout><PolicyPage title="Cancellation Policy" /></Layout>} />

      <Route path="/admin/login" element={<Layout><AdminLoginPage /></Layout>} />
      <Route path="/admin" element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><Layout><AdminProducts /></Layout></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><Layout><AdminOrders /></Layout></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><Layout><AdminUsers /></Layout></AdminRoute>} />
      <Route path="/admin/banners" element={<AdminRoute><Layout><AdminBanners /></Layout></AdminRoute>} />
      <Route path="/admin/enquiries" element={<AdminRoute><Layout><AdminEnquiries /></Layout></AdminRoute>} />
      <Route path="/admin/coupons" element={<AdminRoute><Layout><AdminCoupons /></Layout></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><Layout><AdminSettings /></Layout></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><Layout><AdminCategories /></Layout></AdminRoute>} />
      <Route path="/admin/reviews" element={<AdminRoute><Layout><AdminReviews /></Layout></AdminRoute>} />

      <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
    </Routes>
  );
}
