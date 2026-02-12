'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useWatchlist } from '@/hooks/useWatchlist';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/contexts/ToastContext';
import FeedbackForm from '@/components/FeedbackForm';
import Onboarding from '@/components/Onboarding';
import { SkeletonUserHeader, SkeletonProfileSection } from '@/components/ui/SkeletonLoader';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { subscription, isLoading: isLoadingSubscription } = useSubscription();
  const { watchlist, isLoading: isLoadingWatchlist } = useWatchlist();
  const { showToast } = useToast();

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Get user initials for avatar
  const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get tier badge color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'bg-accent text-primaryDark';
      case 'pro':
        return 'bg-warning text-primaryDark';
      case 'free':
      default:
        return 'bg-textMuted text-white';
    }
  };

  // Get tier display name
  const getTierDisplayName = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await logout();
      // Logout function handles redirect to /login
    } catch (error) {
      console.error('Sign out error:', error);
      showToast('Failed to sign out. Please try again.', 'error');
      setIsSigningOut(false);
      setShowSignOutConfirm(false);
    }
  };

  // Handle clear cache
  const handleClearCache = () => {
    // Clear SWR cache by reloading the page
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-primary pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <SkeletonUserHeader />
          <SkeletonProfileSection />
          <SkeletonProfileSection />
          <SkeletonProfileSection />
        </div>
      </div>
    );
  }

  const favoritesCount = watchlist?.length || 0;
  const lastSyncTime = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-primary pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* User Header */}
        <div className="bg-primaryLight rounded-lg p-6 border border-border">
          <div className="flex items-start gap-4">
            {/* User Avatar */}
            <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-primaryDark text-2xl font-bold flex-shrink-0">
              {getInitials(user.display_name)}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-textPrimary truncate">
                  {user.display_name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTierColor(user.tier)}`}>
                  {getTierDisplayName(user.tier)}
                </span>
              </div>
              <p className="text-textSecondary truncate">{user.email}</p>
            </div>

            {/* Settings Button */}
            <Link
              href="/profile/settings"
              className="px-4 py-2 bg-surface hover:bg-surfaceLight text-textPrimary rounded-lg transition-colors border border-border flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-primaryLight rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold text-textPrimary mb-4">Subscription</h2>

          {isLoadingSubscription ? (
            <div className="space-y-3">
              <div className="h-6 bg-surface rounded animate-pulse w-48"></div>
              <div className="h-6 bg-surface rounded animate-pulse w-64"></div>
              <div className="h-6 bg-surface rounded animate-pulse w-56"></div>
            </div>
          ) : subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-textSecondary">Current Plan</span>
                <span className="text-textPrimary font-semibold">
                  {getTierDisplayName(subscription.tier)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-textSecondary">Watchlist Limit</span>
                <span className="text-textPrimary font-semibold">
                  {subscription.watchlist_limit === -1 ? 'Unlimited' : subscription.watchlist_limit}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-textSecondary">Stocks Tracked</span>
                <span className="text-textPrimary font-semibold">
                  {subscription.stocks_tracked_count}
                </span>
              </div>

              {subscription.billing_period && (
                <div className="flex items-center justify-between">
                  <span className="text-textSecondary">Billing Period</span>
                  <span className="text-textPrimary font-semibold capitalize">
                    {subscription.billing_period}
                  </span>
                </div>
              )}

              {subscription.expires_at && (
                <div className="flex items-center justify-between">
                  <span className="text-textSecondary">Expires</span>
                  <span className="text-textPrimary font-semibold">
                    {new Date(subscription.expires_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-textMuted">No subscription data available</p>
          )}
        </div>

        {/* Data Sync Section */}
        <div className="bg-primaryLight rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold text-textPrimary mb-4">Data Sync</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-textSecondary">Last Sync</span>
              <span className="text-textPrimary font-semibold">{lastSyncTime}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-textSecondary">Sync Frequency</span>
              <span className="text-textPrimary font-semibold">Real-time</span>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 text-sm text-textMuted">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>All data is synced automatically</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data & Storage Section */}
        <div className="bg-primaryLight rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold text-textPrimary mb-4">Data &amp; Storage</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-textSecondary">Favorites</span>
              {isLoadingWatchlist ? (
                <div className="h-6 bg-surface rounded animate-pulse w-12"></div>
              ) : (
                <span className="text-textPrimary font-semibold">
                  {favoritesCount} {favoritesCount === 1 ? 'stock' : 'stocks'}
                </span>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={handleClearCache}
                className="w-full px-4 py-2 bg-surface hover:bg-surfaceLight text-textPrimary rounded-lg transition-colors border border-border"
              >
                Clear Cache
              </button>
              <p className="text-xs text-textMuted mt-2">
                Clears locally cached data and refreshes all information
              </p>
            </div>
          </div>
        </div>

        {/* Help & Learning Section */}
        <div className="bg-primaryLight rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold text-textPrimary mb-4">Help &amp; Learning</h2>

          <div className="space-y-3">
            <button
              onClick={() => setShowOnboarding(true)}
              className="flex items-center justify-between p-3 bg-surface hover:bg-surfaceLight rounded-lg transition-colors group w-full text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <h3 className="text-textPrimary font-semibold">View Onboarding</h3>
                  <p className="text-sm text-textMuted">Quick tour of VETTR features</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-textMuted group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <Link
              href="/profile/glossary"
              className="flex items-center justify-between p-3 bg-surface hover:bg-surfaceLight rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📖</span>
                <div>
                  <h3 className="text-textPrimary font-semibold">Glossary</h3>
                  <p className="text-sm text-textMuted">Financial terms and definitions</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-textMuted group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/profile/faq"
              className="flex items-center justify-between p-3 bg-surface hover:bg-surfaceLight rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">❓</span>
                <div>
                  <h3 className="text-textPrimary font-semibold">FAQ</h3>
                  <p className="text-sm text-textMuted">Frequently asked questions</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-textMuted group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-primaryLight rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold text-textPrimary mb-4">About</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
              <span className="text-textSecondary">Version</span>
              <span className="text-textPrimary font-semibold">1.0.0</span>
            </div>

            <Link
              href="#"
              className="flex items-center justify-between p-3 bg-surface hover:bg-surfaceLight rounded-lg transition-colors group"
            >
              <span className="text-textPrimary">Terms of Service</span>
              <svg className="w-5 h-5 text-textMuted group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>

            <Link
              href="#"
              className="flex items-center justify-between p-3 bg-surface hover:bg-surfaceLight rounded-lg transition-colors group"
            >
              <span className="text-textPrimary">Privacy Policy</span>
              <svg className="w-5 h-5 text-textMuted group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>

            <Link
              href="#"
              className="flex items-center justify-between p-3 bg-surface hover:bg-surfaceLight rounded-lg transition-colors group"
            >
              <span className="text-textPrimary">Contact Support</span>
              <svg className="w-5 h-5 text-textMuted group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </Link>

            <button
              onClick={() => setShowFeedbackForm(true)}
              className="flex items-center justify-between p-3 bg-surface hover:bg-surfaceLight rounded-lg transition-colors group w-full text-left"
            >
              <span className="text-textPrimary">Send Feedback</span>
              <svg className="w-5 h-5 text-textMuted group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="pt-4">
          <button
            onClick={() => setShowSignOutConfirm(true)}
            className="w-full px-6 py-3 bg-error hover:bg-error/80 text-white rounded-lg font-semibold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <Modal
          isOpen={showSignOutConfirm}
          onClose={() => !isSigningOut && setShowSignOutConfirm(false)}
          title="Sign Out"
          size="sm"
        >
          <div className="space-y-6">
            <p className="text-textSecondary">
              Are you sure you want to sign out? You&apos;ll need to log in again to access your account.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                disabled={isSigningOut}
                className="flex-1 px-4 py-2 bg-surface hover:bg-surfaceLight text-textPrimary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex-1 px-4 py-2 bg-error hover:bg-error/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSigningOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing Out...
                  </>
                ) : (
                  'Sign Out'
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Feedback Form Modal */}
      <FeedbackForm
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
      />

      {/* Onboarding Modal */}
      <Onboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}
