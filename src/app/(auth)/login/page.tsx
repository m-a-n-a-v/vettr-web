'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/pulse');
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      // Redirect will happen via useEffect when isAuthenticated changes
      router.push('/pulse');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-accent">VETTR</h1>
          <p className="mt-2 text-textSecondary">
            Canadian Small-Cap Stock Analysis
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-lg bg-primaryLight p-8 shadow-xl">
          <h2 className="mb-6 text-2xl font-bold text-textPrimary">
            Sign In
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md bg-error/10 border border-error/30 p-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-textPrimary mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-surface border border-border px-4 py-2.5 text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                placeholder="you@example.com"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-textPrimary mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-surface border border-border px-4 py-2.5 text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-accent hover:bg-accentDim text-primary font-semibold py-3 px-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-textSecondary">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-accent hover:text-accentDim font-semibold transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-textMuted">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
