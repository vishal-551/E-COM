import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import {
  AboutPage,
  BlogDetailsPage,
  BlogPage,
  ContactPage,
  FAQPage,
  HomePage,
  NotFoundPage,
  ProjectDetailsPage,
  ProjectsPage,
  QuotePage,
  ServicesPage,
} from './pages/PublicPages';
import { AdminDashboard, AdminLoginPage } from './pages/admin/AdminPanel';
import { useAuth } from './context/AuthContext';

function ProtectedAdmin({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
      <Route path="/projects" element={<Layout><ProjectsPage /></Layout>} />
      <Route path="/projects/:slug" element={<Layout><ProjectDetailsPage /></Layout>} />
      <Route path="/blog" element={<Layout><BlogPage /></Layout>} />
      <Route path="/blog/:slug" element={<Layout><BlogDetailsPage /></Layout>} />
      <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
      <Route path="/request-quote" element={<Layout><QuotePage /></Layout>} />
      <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
      <Route path="/admin/login" element={<Layout><AdminLoginPage /></Layout>} />
      <Route path="/admin" element={<ProtectedAdmin><Layout><AdminDashboard /></Layout></ProtectedAdmin>} />
      <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
import { AnalyticsPage, DashboardPage } from './pages/DashboardPage';
import { ForgotPasswordPage, LoginPage, SignupPage } from './pages/AuthPages';
import { LandingPage, PricingPage } from './pages/PublicPages';
import { ActivityLogsPage, NotificationsPage, ProfilePage, SupportPage } from './pages/OperationsPages';
import { SettingsPage, TeamPage, UsersPage } from './pages/ManagementPages';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="analytics" element={<ProtectedRoute permission="view_analytics"><AnalyticsPage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute permission="manage_users"><UsersPage /></ProtectedRoute>} />
        <Route path="team" element={<ProtectedRoute permission="manage_team"><TeamPage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute permission="manage_settings"><SettingsPage /></ProtectedRoute>} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="activity-logs" element={<ProtectedRoute permission="view_activity_logs"><ActivityLogsPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="support" element={<SupportPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
