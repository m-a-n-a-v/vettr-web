'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { api, setClerkTokenGetter } from '@/lib/api-client';
import { User } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** @deprecated Clerk handles login via the /login page. */
  login: (email: string, password: string) => Promise<void>;
  /** @deprecated Clerk handles signup via the /signup page. */
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken, signOut } = useClerkAuth();

  const [vettrUser, setVettrUser] = useState<User | null>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(false);

  // Register the Clerk token getter with the API client so every
  // authenticated request automatically carries the current session token.
  useEffect(() => {
    setClerkTokenGetter(getToken as () => Promise<string | null>);
  }, [getToken]);

  // Fetch our DB user whenever Clerk sign-in state becomes active.
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && !vettrUser && !isFetchingUser) {
      setIsFetchingUser(true);
      api
        .get<User>('/users/me')
        .then((response) => {
          if (response.success && response.data) {
            setVettrUser(response.data);
          }
        })
        .catch(() => {
          // Network error — will retry on next sign-in state change.
        })
        .finally(() => setIsFetchingUser(false));
    }

    if (!isSignedIn) {
      setVettrUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  const logout = useCallback(async () => {
    await signOut();
    setVettrUser(null);
    // Clear SW caches to prevent stale auth data being served.
    if (typeof window !== 'undefined' && 'caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }
  }, [signOut]);

  const refreshUser = useCallback(async () => {
    const response = await api.get<User>('/users/me');
    if (response.success && response.data) {
      setVettrUser(response.data);
    }
  }, []);

  // Kept for backward compatibility — Clerk now owns the auth flow.
  const login = useCallback(async (_email: string, _password: string) => {
    throw new Error('Use the /login page — Clerk handles authentication.');
  }, []);

  const signup = useCallback(
    async (_email: string, _password: string, _displayName: string) => {
      throw new Error('Use the /signup page — Clerk handles account creation.');
    },
    [],
  );

  const isAuthenticated = !!vettrUser && !!isSignedIn;
  const isLoading = !isLoaded || (!!isSignedIn && isFetchingUser);

  const value: AuthContextType = {
    user: vettrUser,
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
