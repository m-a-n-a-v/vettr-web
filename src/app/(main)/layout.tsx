'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { Header } from '@/components/Header';
import Onboarding from '@/components/Onboarding';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import QuickSearch from '@/components/QuickSearch';
import { useAuth } from '@/contexts/AuthContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showKeyboardShortcutsModal, setShowKeyboardShortcutsModal] = useState(false);
  const [showQuickSearch, setShowQuickSearch] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    if (typeof window !== 'undefined' && isAuthenticated) {
      const hasSeenOnboarding = localStorage.getItem('vettr_has_seen_onboarding');
      if (!hasSeenOnboarding) {
        // Show onboarding on first login
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vettr_has_seen_onboarding', 'true');
    }
  };

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onOpenQuickSearch: () => setShowQuickSearch(true),
    onOpenHelp: () => setShowKeyboardShortcutsModal(true),
    onCloseModal: () => {
      // Close any open modals
      if (showKeyboardShortcutsModal) {
        setShowKeyboardShortcutsModal(false);
      }
      if (showQuickSearch) {
        setShowQuickSearch(false);
      }
    },
    enabled: isAuthenticated,
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-vettr-navy">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-vettr-accent focus:text-vettr-navy focus:rounded focus:outline-none focus:ring-2 focus:ring-vettr-accent"
        >
          Skip to main content
        </a>
        <Navigation />
        <Header />
        {/* Main content area - offset for desktop sidebar and mobile bottom bar */}
        <main id="main-content" className="md:ml-64 pt-16 pb-20 md:pb-0">
          {children}
        </main>
        {/* Onboarding overlay */}
        <Onboarding isOpen={showOnboarding} onClose={handleCloseOnboarding} />
        {/* Keyboard shortcuts help modal */}
        <KeyboardShortcutsModal
          isOpen={showKeyboardShortcutsModal}
          onClose={() => setShowKeyboardShortcutsModal(false)}
        />
        {/* Quick search overlay */}
        <QuickSearch
          isOpen={showQuickSearch}
          onClose={() => setShowQuickSearch(false)}
        />
      </div>
    </ProtectedRoute>
  );
}
