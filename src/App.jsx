import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import {
  AboutPage, AccountPage, CartPage, CheckoutPage, ContactPage, FAQPage, LoginPage, MyOrdersPage, NotFoundPage, PolicyPage, SignupPage, TrackingPage, WishlistPage,
} from './pages/UtilityPages';
import {
  AdminBanners, AdminCategories, AdminCoupons, AdminCustomers, AdminDashboard, AdminLoginPage, AdminOrders, AdminProducts, AdminReviews, AdminSettings,
} from './pages/admin/AdminPages';

const Collection = ({ title, filter }) => <Layout><div className="py-8"><h1 className="section-title mb-4">{title}</h1><ShopPage preset={filter} /></div></Layout>;

const AdminRoute = ({ children }) => localStorage.getItem('aaj_admin') === '1' ? children : <Navigate to="/admin/login" />;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/shop" element={<Layout><ShopPage /></Layout>} />
      <Route path="/categories" element={<Collection title="Categories" />} />
      <Route path="/new-arrivals" element={<Collection title="New Arrivals" filter={(p) => p.newArrival} />} />
      <Route path="/best-sellers" element={<Collection title="Best Sellers" filter={(p) => p.bestseller} />} />
      <Route path="/bridal-collection" element={<Collection title="Bridal Collection" filter={(p) => p.collectionType.includes('Bridal')} />} />
      <Route path="/daily-wear-collection" element={<Collection title="Daily Wear Collection" filter={(p) => p.collectionType.includes('Daily')} />} />
      <Route path="/party-wear-collection" element={<Collection title="Party Wear Collection" filter={(p) => p.collectionType.includes('Party')} />} />
      <Route path="/festival-collection" element={<Collection title="Festival Collection" filter={(p) => p.occasion === 'Festive'} />} />
      <Route path="/offers" element={<Collection title="Offers & Sale" filter={(p) => p.discount >= 20} />} />
      <Route path="/product/:slug" element={<Layout><ProductPage /></Layout>} />
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
      <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
      <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
      <Route path="/cart" element={<Layout><CartPage /></Layout>} />
      <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
      <Route path="/login" element={<Layout><LoginPage /></Layout>} />
      <Route path="/signup" element={<Layout><SignupPage /></Layout>} />
      <Route path="/account" element={<Layout><AccountPage /></Layout>} />
      <Route path="/order-tracking" element={<Layout><TrackingPage /></Layout>} />
      <Route path="/my-orders" element={<Layout><MyOrdersPage /></Layout>} />
      <Route path="/privacy-policy" element={<Layout><PolicyPage title="Privacy Policy" /></Layout>} />
      <Route path="/terms-and-conditions" element={<Layout><PolicyPage title="Terms and Conditions" /></Layout>} />
      <Route path="/shipping-policy" element={<Layout><PolicyPage title="Shipping Policy" /></Layout>} />
      <Route path="/return-and-exchange-policy" element={<Layout><PolicyPage title="Return and Exchange Policy" /></Layout>} />
      <Route path="/cancellation-policy" element={<Layout><PolicyPage title="Cancellation Policy" /></Layout>} />

      <Route path="/admin" element={<Navigate to={localStorage.getItem('aaj_admin') === '1' ? '/admin/dashboard' : '/admin/login'} replace />} />
      <Route path="/admin/login" element={<Layout><AdminLoginPage /></Layout>} />
      <Route path="/admin/dashboard" element={<Layout><AdminRoute><AdminDashboard /></AdminRoute></Layout>} />
      <Route path="/admin/products" element={<Layout><AdminRoute><AdminProducts /></AdminRoute></Layout>} />
      <Route path="/admin/categories" element={<Layout><AdminRoute><AdminCategories /></AdminRoute></Layout>} />
      <Route path="/admin/orders" element={<Layout><AdminRoute><AdminOrders /></AdminRoute></Layout>} />
      <Route path="/admin/banners" element={<Layout><AdminRoute><AdminBanners /></AdminRoute></Layout>} />
      <Route path="/admin/customers" element={<Layout><AdminRoute><AdminCustomers /></AdminRoute></Layout>} />
      <Route path="/admin/coupons" element={<Layout><AdminRoute><AdminCoupons /></AdminRoute></Layout>} />
      <Route path="/admin/reviews" element={<Layout><AdminRoute><AdminReviews /></AdminRoute></Layout>} />
      <Route path="/admin/settings" element={<Layout><AdminRoute><AdminSettings /></AdminRoute></Layout>} />
      <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
    </Routes>
  );
}
