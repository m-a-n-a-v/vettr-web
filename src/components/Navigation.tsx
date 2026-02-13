'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  PulseIcon,
  CompassIcon,
  GridIcon,
  BellIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogOutIcon,
} from '@/components/icons';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Pulse', href: '/pulse', icon: PulseIcon },
  { label: 'Discovery', href: '/discovery', icon: CompassIcon },
  { label: 'Stocks', href: '/stocks', icon: GridIcon },
  { label: 'Alerts', href: '/alerts', icon: BellIcon },
  { label: 'Profile', href: '/profile', icon: UserIcon },
];

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
      return 'bg-gray-500/10 text-gray-400';
  }
};

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const handleLogout = async () => {
    await logout();
  };

  const userInitials = user ? getUserInitials(user.display_name) : 'U';
  const tierBadgeColor = user ? getTierBadgeColor(user.tier) : 'bg-gray-500/10 text-gray-400';

  return (
    <>
      {/* Desktop Sidebar (>= 768px) */}
      <aside
        className={`
          hidden md:flex md:flex-col
          fixed left-0 top-0 h-screen
          bg-white dark:bg-vettr-dark border-r border-gray-200 dark:border-white/5
          transition-all duration-200 ease-in-out
          ${isSidebarCollapsed ? 'w-16' : 'w-64'}
          z-40
        `}
      >
        {/* Sidebar Header - Logo + Collapse Button */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-white/5">
          <h1
            className={`
              font-bold text-xl
              transition-opacity duration-200
              ${isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}
            `}
          >
            <span className="text-vettr-accent">V</span>
            <span className="text-gray-900 dark:text-white">ETTR</span>
          </h1>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-gray-400 hover:text-white hover:bg-white/5 rounded-lg p-1.5 transition-colors"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 overflow-y-auto" aria-label="Main navigation">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const IconComponent = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-200
                      ${
                        active
                          ? 'text-vettr-accent bg-vettr-accent/10'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                      }
                      ${isSidebarCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    <span
                      className={`
                        transition-opacity duration-200
                        ${isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}
                      `}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer - User Info + Logout */}
        {user && (
          <div className="border-t border-gray-200 dark:border-white/5 p-3">
            {!isSidebarCollapsed ? (
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-vettr-accent/20 to-vettr-accent/5 flex items-center justify-center text-vettr-accent font-semibold text-sm flex-shrink-0">
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.display_name}
                    </p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${tierBadgeColor}`}>
                      {user.tier.toUpperCase()}
                    </span>
                  </div>
                </div>
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                  <LogOutIcon className="w-5 h-5" aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                aria-label="Sign out"
              >
                <LogOutIcon className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Mobile Bottom Tab Bar (< 768px) */}
      <nav
        className="
          md:hidden
          fixed bottom-0 left-0 right-0
          bg-white/95 dark:bg-vettr-dark/95 backdrop-blur-lg border-t border-gray-200 dark:border-white/5
          z-50
        "
        aria-label="Main navigation"
      >
        <ul className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const IconComponent = item.icon;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={`
                    flex flex-col items-center justify-center h-full gap-1
                    transition-colors duration-200 relative
                    ${active ? 'text-vettr-accent' : 'text-gray-600 dark:text-gray-400'}
                  `}
                >
                  {/* Active dot indicator */}
                  {active && (
                    <div className="absolute top-0 w-1 h-1 rounded-full bg-vettr-accent" />
                  )}
                  <IconComponent className="w-5 h-5" aria-hidden="true" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
