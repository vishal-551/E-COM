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
    </Routes>
  );
}
