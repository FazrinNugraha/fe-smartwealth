/**
 * Auth Context - Manage authentication state
 *
 * Auth is verified with the backend before protected pages are rendered.
 * This avoids showing stale cached dashboard data while Render is waking up.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, googleAuth as apiGoogleAuth, getCurrentUser } from '../api';

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithGoogle: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_CACHE_KEY = 'user';

const setCachedUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_CACHE_KEY);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Keep protected routes on a connection screen until the token is verified.
  const [loading, setLoading] = useState(() => !!localStorage.getItem('access_token'));

  // Verify token and sync user data on every mount.
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setUser(null);
        setCachedUser(null);
        setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setCachedUser(userData);
      } catch (error) {
        // Token invalid/expired — clear everything
        console.error('Failed to verify auth:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setCachedUser(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiLogin({ email, password });
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);

    const userData = await getCurrentUser();
    setUser(userData);
    setCachedUser(userData);
  };

  const register = async (email: string, password: string, fullName: string) => {
    const response = await apiRegister({
      email,
      password,
      full_name: fullName,
    });
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);

    const userData = await getCurrentUser();
    setUser(userData);
    setCachedUser(userData);
  };

  const loginWithGoogle = async (code: string) => {
    const response = await apiGoogleAuth(code);
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);

    const userData = await getCurrentUser();
    setUser(userData);
    setCachedUser(userData);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await apiLogout(refreshToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setCachedUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
