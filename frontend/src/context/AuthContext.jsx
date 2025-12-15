// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: null,
    loading: false,
  });

  // initial load: localStorage se user + token lo
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRaw = localStorage.getItem('authUser');
    let user = null;
    if (userRaw) {
      try {
        user = JSON.parse(userRaw);
      } catch {
        user = null;
      }
    }
    if (token) {
      setAuth({ user, token, loading: false });
    }
  }, []);

  const login = async (email, password) => {
    try {
      setAuth((prev) => ({ ...prev, loading: true }));
      const res = await axiosClient.post('/api/auth/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));

      setAuth({ user, token, loading: false });
      return { success: true, user };
    } catch (err) {
      console.error(err);
      setAuth((prev) => ({ ...prev, loading: false }));
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (name, email, password, role = 'user') => {
    try {
      setAuth((prev) => ({ ...prev, loading: true }));
      await axiosClient.post('/api/auth/register', { name, email, password, role });
      setAuth((prev) => ({ ...prev, loading: false }));
      return { success: true };
    } catch (err) {
      console.error(err);
      setAuth((prev) => ({ ...prev, loading: false }));
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setAuth({ user: null, token: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
