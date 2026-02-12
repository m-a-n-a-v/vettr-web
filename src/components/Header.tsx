'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
      return 'bg-accent text-primaryDark';
    case 'pro':
      return 'bg-warning text-primaryDark';
    case 'free':
    default:
      return 'bg-textMuted text-white';
  }
};

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageTitle = getPageTitle(pathname || '');

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
    <header className="fixed top-0 left-0 right-0 h-16 bg-primaryDark border-b border-border z-50 md:ml-64">
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        {/* Left: Mobile hamburger + Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile hamburger menu (shown on mobile only) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-textSecondary hover:text-textPrimary transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Logo - visible on mobile, hidden on desktop (desktop has logo in sidebar) */}
          <Link
            href="/pulse"
            className="md:hidden font-bold text-xl text-accent"
          >
            VETTR
          </Link>
        </div>

        {/* Center: Page title (hidden on mobile) */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-lg font-semibold text-textPrimary">
            {pageTitle}
          </h1>
        </div>

        {/* Right: User menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="User menu"
            aria-expanded={isDropdownOpen}
          >
            {/* User avatar */}
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primaryDark font-bold text-sm">
              {userInitials}
            </div>
            {/* Desktop only: display name and tier */}
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-textPrimary">
                {user.display_name}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierBadgeColor}`}
              >
                {user.tier.toUpperCase()}
              </span>
            </div>
            {/* Dropdown arrow */}
            <svg
              className={`w-4 h-4 text-textSecondary transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-56 bg-primaryLight border border-border rounded-lg shadow-lg overflow-hidden"
              >
                {/* User info (mobile only) */}
                <div className="md:hidden px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-textPrimary">
                    {user.display_name}
                  </p>
                  <p className="text-xs text-textSecondary mt-1">
                    {user.email}
                  </p>
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-2 ${tierBadgeColor}`}
                  >
                    {user.tier.toUpperCase()}
                  </span>
                </div>

                {/* Menu items */}
                <div className="py-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-textPrimary hover:bg-surfaceLight transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/profile/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-textPrimary hover:bg-surfaceLight transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-surfaceLight transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile menu overlay (optional, not in original requirements but improves UX) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primaryLight border-b border-border overflow-hidden"
          >
            <div className="px-4 py-3">
              <p className="text-xs text-textMuted mb-2">Current Page</p>
              <p className="text-base font-semibold text-textPrimary">
                {pageTitle}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
