'use client';

import Link from 'next/link';

interface LoginPromptProps {
  title?: string;
  message?: string;
  compact?: boolean;
}

/**
 * LoginPrompt - shown in place of authenticated-only features for guest users.
 * Provides a clear CTA to sign in or sign up.
 */
export default function LoginPrompt({
  title = 'Sign in to unlock this feature',
  message = 'Create a free account to access portfolio tracking, personalized alerts, and AI insights.',
  compact = false,
}: LoginPromptProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        </div>
        <Link
          href="/login"
          className="px-3 py-1.5 bg-vettr-accent text-vettr-navy text-xs font-semibold rounded-lg hover:bg-vettr-accent/90 transition-colors flex-shrink-0"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-10 px-4">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-vettr-accent/10 mb-4">
        <svg className="w-7 h-7 text-vettr-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-5">{message}</p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/login"
          className="px-5 py-2.5 bg-vettr-accent text-vettr-navy text-sm font-semibold rounded-xl hover:bg-vettr-accent/90 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-5 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
