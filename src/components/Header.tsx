'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuickSearch } from '@/contexts/QuickSearchContext';
import { useUnreadAlertCount } from '@/hooks/useUnreadAlertCount';
import { useAlertTriggers } from '@/hooks/useAlertTriggers';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, RefreshIcon, BellIcon, ChevronDownIcon, CheckCircleIcon, AlertTriangleIcon, FlagIcon, DocumentIcon } from '@/components/icons';

// Map pathname to page title
const getPageTitle = (pathname: string): string => {
  if (pathname === '/pulse') return 'Pulse';
  if (pathname === '/news') return 'News';
  if (pathname === '/stocks') return 'Stocks';
  if (pathname?.startsWith('/stocks/')) {
    const parts = pathname.split('/');
    const ticker = parts[2];
    return ticker?.toUpperCase() || 'Stock Details';
  }
  if (pathname?.startsWith('/filings/')) return 'Filing Details';
  if (pathname === '/ai') return 'AI Analysis';
  if (pathname === '/profile') return 'Profile';
  if (pathname === '/profile/settings') return 'Settings';
  if (pathname === '/profile/glossary') return 'Glossary';
  if (pathname === '/profile/faq') return 'FAQ';
  // Legacy routes
  if (pathname === '/discovery') return 'Discovery';
  if (pathname === '/alerts') return 'Alerts';
  return 'VETTR';
};

// Helper to get user initials
const getUserInitials = (displayName: string): string => {
  const parts = displayName.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return displayName.substring(0, 2).toUpperCase();
};

// Helper to format tier badge
const getTierBadgeColor = (tier: string): string => {
  switch (tier) {
    case 'premium':
      return 'bg-vettr-accent/10 text-vettr-accent';
    case 'pro':
      return 'bg-yellow-500/10 text-yellow-400';
    case 'free':
    default:
      return 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400';
  }
};

// Get icon for alert type
const getAlertTypeIcon = (alertType: string) => {
  switch (alertType.toLowerCase()) {
    case 'red flag':
    case 'red_flag':
      return <FlagIcon className="w-4 h-4 text-red-400" />;
    case 'financing':
      return <DocumentIcon className="w-4 h-4 text-yellow-400" />;
    case 'executive_changes':
    case 'executive changes':
      return <AlertTriangleIcon className="w-4 h-4 text-orange-400" />;
    default:
      return <BellIcon className="w-4 h-4 text-vettr-accent" />;
  }
};

// Format relative time for notifications
const formatRelativeTime = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { openQuickSearch } = useQuickSearch();
  const { unreadCount, mutate: mutateUnreadCount } = useUnreadAlertCount();
  const { triggers, markAsRead, markAllAsRead, isMarkingAllRead, mutate: mutateTriggers } = useAlertTriggers();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const pageTitle = getPageTitle(pathname || '');

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    window.location.reload();
  };

  // Handle Cmd+K search click
  const handleSearchClick = () => {
    openQuickSearch();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    if (isDropdownOpen || isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isNotificationsOpen]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  if (!user) return null;

  const userInitials = getUserInitials(user.display_name);
  const tierBadgeColor = getTierBadgeColor(user.tier);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-vettr-navy/80 backdrop-blur-lg border-b border-gray-200 dark:border-white/5 z-50 md:ml-64 transition-colors duration-200">
      <div className="h-full flex items-center justify-between px-4 md:px-6 gap-4">
        {/* Left: Page title */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Mobile logo */}
          <Link
            href="/pulse"
            className="md:hidden font-bold text-xl"
          >
            <span className="text-vettr-accent">V</span>
            <span className="text-gray-900 dark:text-white">ETTR</span>
          </Link>
          {/* Desktop page title */}
          <h1 className="hidden md:block text-lg font-semibold text-gray-900 dark:text-white">
            {pageTitle}
          </h1>
        </div>

        {/* Center-right: Search shortcut (desktop only) */}
        <button
          onClick={handleSearchClick}
          className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-200 dark:hover:bg-white/[0.07] hover:border-gray-300 dark:hover:border-white/20 transition-all flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-vettr-accent/30 active:scale-[0.98]"
        >
          <SearchIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Quick search...</span>
          <span className="lg:hidden">Search</span>
          <kbd className="ml-2 px-1.5 py-0.5 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/10 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
            ⌘K
          </kbd>
        </button>

        {/* Right: Actions + User menu */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-vettr-accent/30 active:scale-95"
            aria-label="Refresh page"
          >
            <RefreshIcon className="w-5 h-5" />
          </button>

          {/* Notification bell */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsDropdownOpen(false);
              }}
              className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-vettr-accent/30 active:scale-95"
              aria-label="Notifications"
              aria-expanded={isNotificationsOpen}
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-vettr-accent text-white text-[10px] font-bold rounded-full px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown panel */}
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-vettr-card border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-vettr-accent/10 text-vettr-accent px-2 py-0.5 rounded-full font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          await markAllAsRead();
                          mutateUnreadCount();
                        }}
                        disabled={isMarkingAllRead}
                        className="text-xs text-vettr-accent hover:text-vettr-accent/80 font-medium transition-colors disabled:opacity-50"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  <div className="max-h-80 overflow-y-auto">
                    {triggers.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <BellIcon className="w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Set up alert rules on stocks to get notified
                        </p>
                      </div>
                    ) : (
                      triggers.slice(0, 20).map((trigger) => (
                        <button
                          key={trigger.id}
                          onClick={async () => {
                            if (!trigger.is_read) {
                              await markAsRead(trigger.id);
                              mutateUnreadCount();
                            }
                            if (trigger.ticker) {
                              setIsNotificationsOpen(false);
                              router.push(`/stocks/${trigger.ticker}`);
                            }
                          }}
                          className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5 last:border-b-0 ${
                            !trigger.is_read ? 'bg-vettr-accent/5 dark:bg-vettr-accent/5' : ''
                          }`}
                        >
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {getAlertTypeIcon(trigger.alert_type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm truncate ${
                                !trigger.is_read
                                  ? 'font-semibold text-gray-900 dark:text-white'
                                  : 'font-medium text-gray-700 dark:text-gray-300'
                              }`}>
                                {trigger.title}
                              </p>
                              {!trigger.is_read && (
                                <span className="flex-shrink-0 w-2 h-2 bg-vettr-accent rounded-full mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                              {trigger.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {trigger.ticker && (
                                <span className="text-[10px] font-medium text-vettr-accent bg-vettr-accent/10 px-1.5 py-0.5 rounded">
                                  {trigger.ticker}
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                {formatRelativeTime(trigger.triggered_at)}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 border-t border-gray-200 dark:border-white/5">
                    <Link
                      href="/pulse"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block text-center text-xs font-medium text-vettr-accent hover:text-vettr-accent/80 transition-colors"
                    >
                      View all alerts
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User avatar dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotificationsOpen(false); }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-vettr-accent/30 rounded-full active:scale-95"
              aria-label="User menu"
              aria-expanded={isDropdownOpen}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-vettr-accent/20 to-vettr-accent/5 flex items-center justify-center text-vettr-accent font-semibold text-sm">
                {userInitials}
              </div>
              <ChevronDownIcon
                className={`hidden md:block w-4 h-4 text-gray-400 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                  className="absolute right-0 mt-2 w-64 sm:w-56 max-w-[calc(100vw-2rem)] bg-white dark:bg-vettr-card border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden"
                >
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-white/5">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.display_name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {user.email}
                    </p>
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-2 ${tierBadgeColor}`}
                    >
                      {user.tier.toUpperCase()}
                    </span>
                  </div>

                  {/* Menu items */}
                  <div className="p-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vettr-accent/30"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/profile/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vettr-accent/30"
                    >
                      Settings
                    </Link>
                    <div className="h-px bg-gray-200 dark:bg-white/5 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vettr-accent/30 active:scale-[0.98]"
                    >
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
