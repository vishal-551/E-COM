import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../lib/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const profile = await authService.profile();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (payloadOrEmail, maybePassword) => {
    const payload = typeof payloadOrEmail === 'string'
      ? { email: payloadOrEmail, password: maybePassword }
      : payloadOrEmail;

    const data = await authService.signIn(payload);
    setUser(data.user);
    return data.user;
  };

  const signup = async (payload) => {
    const data = await authService.signUp(payload);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    authService.signOut();
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    admin: user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    signup,
    logout,
    refresh,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
