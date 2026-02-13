'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuickSearch } from '@/contexts/QuickSearchContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, RefreshIcon, BellIcon, ChevronDownIcon } from '@/components/icons';

// Map pathname to page title
const getPageTitle = (pathname: string): string => {
  if (pathname === '/pulse') return 'Pulse';
  if (pathname === '/discovery') return 'Discovery';
  if (pathname === '/stocks') return 'Stocks';
  if (pathname?.startsWith('/stocks/')) {
    // Extract ticker from path
    const parts = pathname.split('/');
    const ticker = parts[2];
    return ticker?.toUpperCase() || 'Stock Details';
  }
  if (pathname?.startsWith('/filings/')) return 'Filing Details';
  if (pathname === '/alerts') return 'Alerts';
  if (pathname === '/profile') return 'Profile';
  if (pathname === '/profile/settings') return 'Settings';
  if (pathname === '/profile/glossary') return 'Glossary';
  if (pathname === '/profile/faq') return 'FAQ';
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
      return 'bg-white/10 text-gray-400';
  }
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { openQuickSearch } = useQuickSearch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageTitle = getPageTitle(pathname || '');

  // Handle refresh button click
  const handleRefresh = () => {
    window.location.reload();
  };

  // Handle Cmd+K search click
  const handleSearchClick = () => {
    openQuickSearch();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  if (!user) return null;

  const userInitials = getUserInitials(user.display_name);
  const tierBadgeColor = getTierBadgeColor(user.tier);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-vettr-navy/80 backdrop-blur-lg border-b border-white/5 z-40 md:ml-64">
      <div className="h-full flex items-center justify-between px-4 md:px-6 gap-4">
        {/* Left: Page title */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Mobile logo */}
          <Link
            href="/pulse"
            className="md:hidden font-bold text-xl"
          >
            <span className="text-vettr-accent">V</span>
            <span className="text-white">ETTR</span>
          </Link>
          {/* Desktop page title */}
          <h1 className="hidden md:block text-lg font-semibold text-white">
            {pageTitle}
          </h1>
        </div>

        {/* Center-right: Search shortcut (desktop only) */}
        <button
          onClick={handleSearchClick}
          className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-white/[0.07] hover:border-white/20 transition-all"
        >
          <SearchIcon className="w-4 h-4" />
          <span>Quick search...</span>
          <kbd className="ml-2 px-1.5 py-0.5 bg-white/10 border border-white/10 rounded text-xs font-medium text-gray-400">
            ⌘K
          </kbd>
        </button>

        {/* Right: Actions + User menu */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Refresh page"
          >
            <RefreshIcon className="w-5 h-5" />
          </button>

          {/* Notification bell */}
          <button
            className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <BellIcon className="w-5 h-5" />
            {/* Notification badge (optional - can be dynamic later) */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-vettr-accent rounded-full" />
          </button>

          {/* User avatar dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
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
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-vettr-card border border-white/10 rounded-xl shadow-xl overflow-hidden"
                >
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-medium text-white truncate">
                      {user.display_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 truncate">
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
                      className="block px-3 py-2 text-sm text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/profile/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-3 py-2 text-sm text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Settings
                    </Link>
                    <div className="h-px bg-white/5 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5 rounded-lg transition-colors"
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
