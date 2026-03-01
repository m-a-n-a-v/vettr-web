'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  // Retries up to 3 times with back-off to handle cases where the
  // Clerk session token isn't immediately available after sign-in.
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setVettrUser(null);
      return;
    }

    if (vettrUser || isFetchingUser) return;

    let cancelled = false;

    async function fetchUser(attempt: number) {
      if (cancelled) return;
      setIsFetchingUser(true);

      try {
        // Ensure the Clerk token is available before calling the backend
        const token = await getToken();
        if (!token) {
          if (attempt < 3 && !cancelled) {
            setIsFetchingUser(false);
            retryRef.current = setTimeout(() => fetchUser(attempt + 1), 1000 * (attempt + 1));
            return;
          }
          setIsFetchingUser(false);
          return;
        }

        const response = await api.get<User>('/users/me');
        if (!cancelled && response.success && response.data) {
          setVettrUser(response.data);
        } else if (!cancelled && attempt < 3) {
          // Backend returned an error — retry after delay
          retryRef.current = setTimeout(() => fetchUser(attempt + 1), 1500 * (attempt + 1));
          return;
        }
      } catch {
        // Network error — retry
        if (!cancelled && attempt < 3) {
          retryRef.current = setTimeout(() => fetchUser(attempt + 1), 1500 * (attempt + 1));
          return;
        }
      }

      if (!cancelled) setIsFetchingUser(false);
    }

    fetchUser(0);

    return () => {
      cancelled = true;
      if (retryRef.current) clearTimeout(retryRef.current);
    };
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
