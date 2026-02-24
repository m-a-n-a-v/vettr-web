'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // No token = invalid link
  if (!token) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid Reset Link</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block bg-vettr-accent text-vettr-navy font-semibold rounded-xl px-6 py-3 hover:bg-vettr-accent/90 transition-colors"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/reset-password', { token, password }, { requiresAuth: false });
      if (!response.success) {
        setError(response.error?.message || 'Failed to reset password. The link may have expired.');
        return;
      }
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-vettr-accent/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-vettr-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password Reset</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Your password has been reset successfully. You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="inline-block bg-vettr-accent text-vettr-navy font-semibold rounded-xl px-6 py-3 hover:bg-vettr-accent/90 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Enter your new password below.
      </p>

      {error && (
        <div role="alert" className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-vettr-accent/50 focus:ring-1 focus:ring-vettr-accent/20 transition-all"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            disabled={isLoading}
            autoComplete="new-password"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-vettr-accent/50 focus:ring-1 focus:ring-vettr-accent/20 transition-all"
            placeholder="Re-enter your password"
            disabled={isLoading}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-vettr-accent text-vettr-navy font-semibold rounded-xl py-3 hover:bg-vettr-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-vettr-navy" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-500 text-center">
        Password must be at least 8 characters with 1 uppercase letter and 1 number.
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen bg-lightBg dark:bg-vettr-navy transition-colors duration-200">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,230,118,0.04)_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,_rgba(0,230,118,0.08)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(68,138,255,0.03)_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,_rgba(68,138,255,0.05)_0%,_transparent_50%)]" />

      <div className="relative z-10 flex w-full items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              <span className="text-vettr-accent">V</span>ETTR
            </h1>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-2xl p-8">
            <Suspense fallback={
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-vettr-accent border-t-transparent rounded-full mx-auto" />
              </div>
            }>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
