import { createContext, useContext, useMemo, useState } from 'react';
import api from '../utils/api';
import { clearAdminSession, getAdminToken, setAdminSession } from '../utils/adminAuth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin/login', { email, password });
      setAdminSession(data.token);
      setAdmin(data.admin);
      return data;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = async () => {
    const token = localStorage.getItem('saas_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('saas_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAdminSession();
    setAdmin(null);
  };

  const value = useMemo(() => ({ admin, login, logout, loading, isAuthenticated: Boolean(admin || getAdminToken()) }), [admin, loading]);
  useEffect(() => {
    bootstrap();
  }, []);

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    localStorage.setItem('saas_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    localStorage.setItem('saas_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('saas_token');
    setUser(null);
  };

  const hasPermission = (permission) => user?.permissions?.includes(permission);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, hasPermission, refresh: bootstrap }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
