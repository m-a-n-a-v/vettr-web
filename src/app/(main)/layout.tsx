'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { Header } from '@/components/Header';
import Onboarding from '@/components/Onboarding';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import QuickSearch from '@/components/QuickSearch';
import { useAuth } from '@/contexts/AuthContext';
import { QuickSearchProvider, useQuickSearch } from '@/contexts/QuickSearchContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { isOpen: showQuickSearch, openQuickSearch, closeQuickSearch } = useQuickSearch();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showKeyboardShortcutsModal, setShowKeyboardShortcutsModal] = useState(false);

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
    onOpenQuickSearch: openQuickSearch,
    onOpenHelp: () => setShowKeyboardShortcutsModal(true),
    onCloseModal: () => {
      // Close any open modals
      if (showKeyboardShortcutsModal) {
        setShowKeyboardShortcutsModal(false);
      }
      if (showQuickSearch) {
        closeQuickSearch();
      }
    },
    enabled: isAuthenticated,
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-lightBg dark:bg-vettr-navy transition-colors duration-200 relative">
        {/* Background gradients for depth - subtle in both modes */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,230,118,0.02)_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,_rgba(0,230,118,0.04)_0%,_transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(68,138,255,0.015)_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,_rgba(68,138,255,0.03)_0%,_transparent_50%)] pointer-events-none" />

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
        <main id="main-content" className="md:ml-64 pt-16 pb-20 md:pb-0 transition-colors duration-200 relative z-10">
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
        <QuickSearch isOpen={showQuickSearch} onClose={closeQuickSearch} />
      </div>
    </ProtectedRoute>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <QuickSearchProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </QuickSearchProvider>
  );
}
