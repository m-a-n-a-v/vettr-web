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

  // Get tier badge color (V2 design tokens)
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'bg-vettr-accent/10 text-vettr-accent';
      case 'pro':
        return 'bg-yellow-400/10 text-yellow-400';
      case 'free':
      default:
        return 'bg-gray-400/10 text-gray-400';
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
      <div className="min-h-screen bg-vettr-navy pb-20 md:pb-6">
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
    <div className="min-h-screen bg-vettr-navy pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* User Header */}
        <div className="bg-vettr-card/30 rounded-2xl p-4 sm:p-6 border border-white/5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* User Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-vettr-accent/20 to-vettr-accent/5 flex items-center justify-center text-vettr-accent text-xl font-bold flex-shrink-0">
              {getInitials(user.display_name)}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-white mb-1 truncate">
                {user.display_name}
              </h1>
              <p className="text-gray-400 text-sm truncate mb-2">{user.email}</p>
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-medium ${getTierColor(user.tier)}`}>
                {getTierDisplayName(user.tier)}
              </span>
            </div>

            {/* Settings Button */}
            <Link
              href="/profile/settings"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10 flex items-center gap-2 w-full sm:w-auto justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-vettr-accent/30 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-vettr-card/30 border border-white/5 rounded-2xl overflow-hidden">
          <h2 className="text-lg font-semibold text-white px-6 py-4 border-b border-white/5">Account</h2>

          {isLoadingSubscription ? (
            <div className="space-y-0">
              <div className="px-6 py-4 border-b border-white/5">
                <div className="h-6 bg-white/5 rounded animate-pulse w-48"></div>
              </div>
              <div className="px-6 py-4 border-b border-white/5">
                <div className="h-6 bg-white/5 rounded animate-pulse w-64"></div>
              </div>
              <div className="px-6 py-4">
                <div className="h-6 bg-white/5 rounded animate-pulse w-56"></div>
              </div>
            </div>
          ) : subscription ? (
            <div className="space-y-0">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <span className="text-gray-400 text-sm">Current Plan</span>
                <span className="text-white font-medium text-sm">
                  {getTierDisplayName(subscription.tier)}
                </span>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <span className="text-gray-400 text-sm">Watchlist Limit</span>
                <span className="text-white font-medium text-sm">
                  {subscription.watchlist_limit === -1 ? 'Unlimited' : subscription.watchlist_limit}
                </span>
              </div>

              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-gray-400 text-sm">Stocks Tracked</span>
                <span className="text-white font-medium text-sm">
                  {subscription.stocks_tracked_count}
                </span>
              </div>
            </div>
          ) : (
            <div className="px-6 py-4">
              <p className="text-gray-500 text-sm">No subscription data available</p>
            </div>
          )}
        </div>

        {/* Data Section */}
        <div className="bg-vettr-card/30 border border-white/5 rounded-2xl overflow-hidden">
          <h2 className="text-lg font-semibold text-white px-6 py-4 border-b border-white/5">Data</h2>

          <div className="space-y-0">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <span className="text-gray-400 text-sm">Favorites</span>
              {isLoadingWatchlist ? (
                <div className="h-5 bg-white/5 rounded animate-pulse w-12"></div>
              ) : (
                <span className="text-white font-medium text-sm">
                  {favoritesCount} {favoritesCount === 1 ? 'stock' : 'stocks'}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <span className="text-gray-400 text-sm">Last Sync</span>
              <span className="text-white font-medium text-sm">{lastSyncTime}</span>
            </div>

            <button
              onClick={handleClearCache}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vettr-accent/30"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <div>
                  <p className="text-white text-sm font-medium">Clear Cache</p>
                  <p className="text-gray-500 text-xs">Refresh all information</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-vettr-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-vettr-card/30 border border-white/5 rounded-2xl overflow-hidden">
          <h2 className="text-lg font-semibold text-white px-6 py-4 border-b border-white/5">Help</h2>

          <div className="space-y-0">
            <Link
              href="/profile/glossary"
              className="flex items-center justify-between px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vettr-accent/30"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <div>
                  <p className="text-white text-sm font-medium">Glossary</p>
                  <p className="text-gray-500 text-xs">Financial terms and definitions</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-vettr-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/profile/faq"
              className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vettr-accent/30"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <div>
                  <p className="text-white text-sm font-medium">FAQ</p>
                  <p className="text-gray-500 text-xs">Frequently asked questions</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-vettr-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-vettr-card/30 border border-white/5 rounded-2xl overflow-hidden">
          <h2 className="text-lg font-semibold text-white px-6 py-4 border-b border-white/5">About</h2>

          <div className="space-y-0">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <span className="text-gray-400 text-sm">Version</span>
              <span className="text-white font-medium text-sm">1.0.0</span>
            </div>

            <Link
              href="#"
              className="flex items-center justify-between px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vettr-accent/30"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="text-white text-sm font-medium">Terms</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-vettr-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="#"
              className="flex items-center justify-between px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vettr-accent/30"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <p className="text-white text-sm font-medium">Privacy</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-vettr-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="#"
              className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <p className="text-white text-sm font-medium">Contact</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-vettr-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="pt-2">
          <button
            onClick={() => setShowSignOutConfirm(true)}
            className="w-full px-6 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl font-medium transition-colors border border-white/5"
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
            <p className="text-gray-400">
              Are you sure you want to sign out? You&apos;ll need to log in again to access your account.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                disabled={isSigningOut}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
