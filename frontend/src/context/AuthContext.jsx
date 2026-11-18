import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pocket_paise_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('pocket_paise_access'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('pocket_paise_access');
      if (accessToken) {
        try {
          const res = await profileAPI.getMe();
          setUser(res.data);
          localStorage.setItem('pocket_paise_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Auth check failed:", err);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access, refresh, user: userData } = res.data;
    localStorage.setItem('pocket_paise_access', access);
    localStorage.setItem('pocket_paise_refresh', refresh);
    localStorage.setItem('pocket_paise_user', JSON.stringify(userData));
    setToken(access);
    setUser(userData);
    return res.data;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const { access, refresh, user: userData } = res.data;
    localStorage.setItem('pocket_paise_access', access);
    localStorage.setItem('pocket_paise_refresh', refresh);
    localStorage.setItem('pocket_paise_user', JSON.stringify(userData));
    setToken(access);
    setUser(userData);
    return res.data;
  };

  const demoLogin = async () => {
    return login('dreamer@pocketpaise.com', 'Password123!');
  };

  const logout = async () => {
    const refresh = localStorage.getItem('pocket_paise_refresh');
    if (refresh) {
      try {
        await authAPI.logout(refresh);
      } catch (e) {
        // Ignore logout error
      }
    }
    localStorage.removeItem('pocket_paise_access');
    localStorage.removeItem('pocket_paise_refresh');
    localStorage.removeItem('pocket_paise_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('pocket_paise_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
