'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: string; // Using text icons for now, can be replaced with SVG/Icon library later
}

const navItems: NavItem[] = [
  { label: 'Pulse', href: '/pulse', icon: '📈' },
  { label: 'Discovery', href: '/discovery', icon: '🔍' },
  { label: 'Stocks', href: '/stocks', icon: '📋' },
  { label: 'Alerts', href: '/alerts', icon: '🔔' },
  { label: 'Profile', href: '/profile', icon: '👤' },
];

export function Navigation() {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <>
      {/* Desktop Sidebar (>= 768px) */}
      <aside
        className={`
          hidden md:flex md:flex-col
          fixed left-0 top-0 h-screen
          bg-primaryDark border-r border-border
          transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'w-20' : 'w-64'}
          z-40
        `}
      >
        {/* Logo/Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <h1
            className={`
              font-bold text-xl text-accent
              transition-opacity duration-300
              ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}
            `}
          >
            VETTR
          </h1>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-textSecondary hover:text-textPrimary transition-colors"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-4 px-4 py-3 rounded-lg
                      transition-all duration-200
                      ${
                        active
                          ? 'bg-accent/10 text-accent border-l-4 border-accent'
                          : 'text-textSecondary hover:bg-surfaceLight hover:text-textPrimary'
                      }
                      ${isSidebarCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span
                      className={`
                        font-medium
                        transition-opacity duration-300
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
      </aside>

      {/* Mobile Bottom Tab Bar (< 768px) */}
      <nav
        className="
          md:hidden
          fixed bottom-0 left-0 right-0
          bg-primaryDark border-t border-border
          z-50
        "
      >
        <ul className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`
                    flex flex-col items-center justify-center h-full gap-1
                    transition-colors duration-200
                    ${active ? 'text-accent' : 'text-textSecondary'}
                  `}
                >
                  <span className="text-xl" aria-hidden="true">
                    {item.icon}
                  </span>
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
