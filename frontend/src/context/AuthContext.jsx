import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      return { success: true, role: user.role };
    } catch (err) {
      const data = err.response?.data || {};
      if (data.needsVerification) {
        return { success: false, needsVerification: true, email: data.email, message: data.message };
      }
      return { success: false, message: data.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      return { success: true, email: res.data.email, message: res.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email, code) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-email', { email, code });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      return { success: true, role: user.role };
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async (email) => {
    setLoading(true);
    try {
      await api.post('/auth/resend-code', { email });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to resend code';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthenticated, isAdmin, isUser, login, register, verifyEmail, resendCode, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
