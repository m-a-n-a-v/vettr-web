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
    <div className="flex min-h-screen bg-vettr-navy">
      {/* Background gradient - subtle accent glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,230,118,0.08)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(68,138,255,0.05)_0%,_transparent_50%)]" />

      {/* Desktop: Split layout */}
      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Left side - Branding (desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:px-12">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-white">
              <span className="text-vettr-accent">V</span>ETTR
            </h1>
            <p className="mt-4 text-xl text-gray-300">
              Canadian Small-Cap Stock Analysis
            </p>
            <p className="mt-6 text-gray-400 leading-relaxed">
              Gain insight into emerging Canadian companies with our comprehensive analysis platform.
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-8 text-center lg:hidden">
              <h1 className="text-4xl font-bold text-white">
                <span className="text-vettr-accent">V</span>ETTR
              </h1>
              <p className="mt-2 text-gray-400">
                Canadian Small-Cap Stock Analysis
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-8">
              <h2 className="mb-6 text-2xl font-bold text-white">
                Sign In
              </h2>

              {/* Error Message */}
              {error && (
                <div
                  id="login-error"
                  role="alert"
                  className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 animate-in fade-in duration-200"
                >
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5" aria-describedby={error ? 'login-error' : undefined}>
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:border-vettr-accent/50 focus:ring-1 focus:ring-vettr-accent/20 transition-all"
                    placeholder="you@example.com"
                    disabled={isLoading}
                    autoComplete="email"
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'login-error' : undefined}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-white"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-gray-400 hover:text-vettr-accent transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:border-vettr-accent/50 focus:ring-1 focus:ring-vettr-accent/20 transition-all"
                    placeholder="Enter your password"
                    disabled={isLoading}
                    autoComplete="current-password"
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'login-error' : undefined}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-vettr-accent text-vettr-navy font-semibold rounded-xl py-3 hover:bg-vettr-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-vettr-navy"
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
                <p className="text-sm text-gray-400">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/signup"
                    className="text-gray-400 hover:text-vettr-accent transition-colors font-medium"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
