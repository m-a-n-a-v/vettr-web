'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import Onboarding from '@/components/Onboarding';
import { useAuth } from '@/contexts/AuthContext';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-primary">
        <Navigation />
        {/* Main content area - offset for desktop sidebar and mobile bottom bar */}
        <main className="md:ml-64 pb-16 md:pb-0">
          {children}
        </main>
        {/* Onboarding overlay */}
        <Onboarding isOpen={showOnboarding} onClose={handleCloseOnboarding} />
      </div>
    </ProtectedRoute>
  );
}
