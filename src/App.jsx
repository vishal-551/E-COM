import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import {
  AboutPage,
  AccountPage,
  CartPage,
  CheckoutPage,
  ContactPage,
  FAQPage,
  LoginPage,
  MyOrdersPage,
  NotFoundPage,
  OrderSuccessPage,
  PolicyPage,
  SignupPage,
  TrackingPage,
  WishlistPage,
} from './pages/UtilityPages';
import {
  AdminBanners,
  AdminCategories,
  AdminCoupons,
  AdminDashboard,
  AdminEnquiries,
  AdminLoginPage,
  AdminLogoutButton,
  AdminOrders,
  AdminProducts,
  AdminSettings,
  AdminUsers,
} from './pages/admin/AdminPages';
import { useStore } from './context/StoreContext';

function ProtectedAdmin({ children }) {
  const { user } = useStore();
  return user?.role === 'admin' || user?.role === 'editor' ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/shop" element={<Layout><ShopPage /></Layout>} />
      <Route path="/product/:slug" element={<Layout><ProductPage /></Layout>} />
      <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
      <Route path="/cart" element={<Layout><CartPage /></Layout>} />
      <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
      <Route path="/order-success/:orderId" element={<Layout><OrderSuccessPage /></Layout>} />
      <Route path="/orders" element={<Layout><MyOrdersPage /></Layout>} />
      <Route path="/tracking" element={<Layout><TrackingPage /></Layout>} />
      <Route path="/profile" element={<Layout><AccountPage /></Layout>} />
      <Route path="/login" element={<Layout><LoginPage /></Layout>} />
      <Route path="/signup" element={<Layout><SignupPage /></Layout>} />
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
      <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
      <Route path="/policy/:slug" element={<Layout><PolicyPage title="Policy" /></Layout>} />

      <Route path="/admin/login" element={<Layout><AdminLoginPage /></Layout>} />
      <Route path="/admin" element={<ProtectedAdmin><Layout><div className="flex justify-between items-center"><AdminDashboard /><AdminLogoutButton /></div></Layout></ProtectedAdmin>} />
      <Route path="/admin/products" element={<ProtectedAdmin><Layout><AdminProducts /></Layout></ProtectedAdmin>} />
      <Route path="/admin/orders" element={<ProtectedAdmin><Layout><AdminOrders /></Layout></ProtectedAdmin>} />
      <Route path="/admin/users" element={<ProtectedAdmin><Layout><AdminUsers /></Layout></ProtectedAdmin>} />
      <Route path="/admin/banners" element={<ProtectedAdmin><Layout><AdminBanners /></Layout></ProtectedAdmin>} />
      <Route path="/admin/categories" element={<ProtectedAdmin><Layout><AdminCategories /></Layout></ProtectedAdmin>} />
      <Route path="/admin/coupons" element={<ProtectedAdmin><Layout><AdminCoupons /></Layout></ProtectedAdmin>} />
      <Route path="/admin/enquiries" element={<ProtectedAdmin><Layout><AdminEnquiries /></Layout></ProtectedAdmin>} />
      <Route path="/admin/settings" element={<ProtectedAdmin><Layout><AdminSettings /></Layout></ProtectedAdmin>} />

      <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
    </Routes>
  );
}
