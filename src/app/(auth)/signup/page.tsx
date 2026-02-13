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
    if (strength === 0) return 'bg-red-500';
    if (strength === 1) return 'bg-red-500';
    if (strength === 2) return 'bg-yellow-500';
    if (strength === 3) return 'bg-vettr-accent';
    return 'bg-vettr-accent';
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
              Join thousands of investors discovering emerging Canadian companies with our comprehensive analysis platform.
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

            {/* Signup Card */}
            <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-8">
              <h2 className="mb-6 text-2xl font-bold text-white">
                Create Account
              </h2>

              {/* Error Message */}
              {error && (
                <div
                  id="signup-error"
                  role="alert"
                  className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 animate-in fade-in duration-200"
                >
                  {error}
                </div>
              )}

              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-5" aria-describedby={error ? 'signup-error' : undefined}>
                {/* Display Name Field */}
                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:border-vettr-accent/50 focus:ring-1 focus:ring-vettr-accent/20 transition-all"
                    placeholder="John Doe"
                    disabled={isLoading}
                    autoComplete="name"
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'signup-error' : undefined}
                  />
                </div>

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
                    aria-describedby={error ? 'signup-error' : undefined}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:border-vettr-accent/50 focus:ring-1 focus:ring-vettr-accent/20 transition-all"
                    placeholder="Minimum 8 characters"
                    disabled={isLoading}
                    autoComplete="new-password"
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'signup-error' : undefined}
                  />

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">
                          Password strength
                        </span>
                        <span className={`text-xs font-medium ${
                          passwordStrength <= 1 ? 'text-red-400' :
                          passwordStrength === 2 ? 'text-yellow-400' :
                          'text-vettr-accent'
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
                                : 'bg-white/5'
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
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:border-vettr-accent/50 focus:ring-1 focus:ring-vettr-accent/20 transition-all"
                    placeholder="Re-enter your password"
                    disabled={isLoading}
                    autoComplete="new-password"
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'signup-error' : undefined}
                  />
                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <div className="mt-1 flex items-center gap-1.5">
                      {password === confirmPassword ? (
                        <>
                          <svg
                            className="h-4 w-4 text-vettr-accent"
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
                          <span className="text-xs text-vettr-accent">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-4 w-4 text-red-400"
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
                          <span className="text-xs text-red-400">Passwords don&apos;t match</span>
                        </>
                      )}
                    </div>
                  )}
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
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-gray-400 hover:text-vettr-accent transition-colors font-medium"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-gray-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
