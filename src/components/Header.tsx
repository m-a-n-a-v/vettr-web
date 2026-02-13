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
    <header className="fixed top-0 left-0 right-0 h-16 bg-vettr-navy/80 backdrop-blur-lg border-b border-white/5 z-40 md:ml-64">
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        {/* Left: Mobile logo */}
        <div className="flex items-center gap-4">
          {/* Logo - visible on mobile, hidden on desktop (desktop has logo in sidebar) */}
          <Link
            href="/pulse"
            className="md:hidden font-bold text-xl"
          >
            <span className="text-vettr-accent">V</span>
            <span className="text-white">ETTR</span>
          </Link>
          {/* Page title on desktop */}
          <h1 className="hidden md:block text-lg font-semibold text-white">
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
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-vettr-accent/20 to-vettr-accent/5 flex items-center justify-center text-vettr-accent font-semibold text-sm">
              {userInitials}
            </div>
            {/* Dropdown arrow - desktop only */}
            <svg
              className={`hidden md:block w-4 h-4 text-gray-400 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
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
                className="absolute right-0 mt-2 w-56 bg-vettr-card border border-white/10 rounded-xl shadow-xl overflow-hidden"
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-medium text-white">
                    {user.display_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
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
    </header>
  );
}
