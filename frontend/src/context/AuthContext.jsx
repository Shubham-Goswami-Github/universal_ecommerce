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

  /* ================= LOGIN (EMAIL OR MOBILE) ================= */
  const login = async (identifier, password) => {
    try {
      setAuth((prev) => ({ ...prev, loading: true }));

      const res = await axiosClient.post('/api/auth/login', {
        identifier, // email OR mobile number
        password,
      });

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

  /* ================= REGISTER (WITH FILE + ADDRESSES) ================= */
  // Register ko aise call kar rahe ho:
  // register(name, email, password, role, extraPayload, profilePic)
  const register = async (
    name,
    email,
    password,
    role = 'user',
    extra = {},
    file // profilePicture
  ) => {
    try {
      setAuth((prev) => ({ ...prev, loading: true }));

      // ---- FormData banate hain (multipart/form-data) ----
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);

      // extra fields
      if (extra.mobileNumber) {
        formData.append('mobileNumber', extra.mobileNumber);
      }
      if (extra.alternateMobileNumber) {
        formData.append('alternateMobileNumber', extra.alternateMobileNumber);
      }
      if (extra.gender) {
        formData.append('gender', extra.gender); // 'male' | 'female' | 'other'
      }
      if (extra.dateOfBirth) {
        // "YYYY-MM-DD" aa raha hai Register.jsx se
        formData.append('dateOfBirth', extra.dateOfBirth);
      }

      // addresses: array -> JSON string
      if (Array.isArray(extra.addresses) && extra.addresses.length > 0) {
        formData.append('addresses', JSON.stringify(extra.addresses));
      }

      // profile picture file
      if (file) {
        // field name MUST be 'profilePicture' (multer .single('profilePicture'))
        formData.append('profilePicture', file);
      }

      await axiosClient.post('/api/auth/register', formData);

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

  // ✅ helper: context me user ko update karo (profile page se use hoga)
  const updateUser = (partialUser) => {
    setAuth((prev) => {
      const current = prev.user || {};
      const updatedUser = { ...current, ...partialUser };
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      return { ...prev, user: updatedUser };
    });
  };

  return (
    <AuthContext.Provider
      value={{ auth, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);