'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/pulse');
    }
  }, [isAuthenticated, router]);

  // Calculate password strength (0-4)
  const getPasswordStrength = (pwd: string): number => {
    let strength = 0;

    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    return Math.min(strength, 4);
  };

  const passwordStrength = getPasswordStrength(password);

  const getStrengthLabel = (strength: number): string => {
    if (strength === 0) return 'Too weak';
    if (strength === 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = (strength: number): string => {
    if (strength === 0) return 'bg-error';
    if (strength === 1) return 'bg-error';
    if (strength === 2) return 'bg-warning';
    if (strength === 3) return 'bg-accent';
    return 'bg-accent';
  };

  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!displayName) {
      setError('Display name is required');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (!confirmPassword) {
      setError('Please confirm your password');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password minimum length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    // Password match validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
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
      await signup(email, password, displayName);
      // Redirect will happen via useEffect when isAuthenticated changes
      router.push('/pulse');
    } catch (err) {
      console.error('Signup error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create account. Please try again.'
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

        {/* Signup Card */}
        <div className="rounded-lg bg-primaryLight p-8 shadow-xl">
          <h2 className="mb-6 text-2xl font-bold text-textPrimary">
            Create Account
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md bg-error/10 border border-error/30 p-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Signup Form */}
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

            {/* Display Name Field */}
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-textPrimary mb-2"
              >
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-md bg-surface border border-border px-4 py-2.5 text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                placeholder="John Doe"
                disabled={isLoading}
                autoComplete="name"
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
                placeholder="Minimum 8 characters"
                disabled={isLoading}
                autoComplete="new-password"
              />

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-textSecondary">
                      Password strength
                    </span>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 1 ? 'text-error' :
                      passwordStrength === 2 ? 'text-warning' :
                      'text-accent'
                    }`}>
                      {getStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level < passwordStrength
                            ? getStrengthColor(passwordStrength)
                            : 'bg-surface'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-textPrimary mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md bg-surface border border-border px-4 py-2.5 text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                placeholder="Re-enter your password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="mt-1 flex items-center gap-1.5">
                  {password === confirmPassword ? (
                    <>
                      <svg
                        className="h-4 w-4 text-accent"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-xs text-accent">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4 text-error"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="text-xs text-error">Passwords don&apos;t match</span>
                    </>
                  )}
                </div>
              )}
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-textSecondary">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-accent hover:text-accentDim font-semibold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-textMuted">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
