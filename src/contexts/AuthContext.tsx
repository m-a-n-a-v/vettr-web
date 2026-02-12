'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, authApi } from '@/lib/api-client';
import { User } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const accessToken = localStorage.getItem('vettr_access_token');
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch current user data to verify token validity
        const response = await api.get<User>('/users/me');
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('vettr_access_token');
          localStorage.removeItem('vettr_refresh_token');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        localStorage.removeItem('vettr_access_token');
        localStorage.removeItem('vettr_refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      if (response.success && response.data) {
        const { user: userData } = response.data;
        // Tokens are already stored by authApi.login
        // Set user state
        setUser(userData);
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      const response = await authApi.signup(email, password, displayName);
      if (response.success && response.data) {
        const { user: userData } = response.data;
        // Tokens are already stored by authApi.signup
        // Set user state
        setUser(userData);
      } else {
        throw new Error(response.error?.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint (clears tokens and redirects)
      await authApi.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local cleanup even if API call fails
      localStorage.removeItem('vettr_access_token');
      localStorage.removeItem('vettr_refresh_token');
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<User>('/users/me');
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
