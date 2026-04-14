import { createContext, useContext, useMemo, useState } from 'react';
import api from '../utils/api';
import { clearAdminSession, getAdminToken, setAdminSession } from '../utils/adminAuth';

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
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAdminSession();
    setAdmin(null);
  };

  const value = useMemo(() => ({ admin, login, logout, loading, isAuthenticated: Boolean(admin || getAdminToken()) }), [admin, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
