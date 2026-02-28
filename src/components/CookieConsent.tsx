'use client';

import { useState, useEffect } from 'react';

const CONSENT_KEY = 'vettr_cookie_consent';

type ConsentState = 'accepted' | 'declined' | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentState;
    setConsent(stored);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setConsent('accepted');
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setConsent('declined');
  };

  if (!mounted || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-zinc-900 border-t border-zinc-700 shadow-2xl"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-zinc-300">
          <p>
            <span className="font-semibold text-white">Cookie Notice</span> — We use essential
            cookies to keep you signed in, and optional analytics cookies to improve the app.
            See our{' '}
            <a href="/privacy" className="underline text-blue-400 hover:text-blue-300">
              Privacy Policy
            </a>
            .
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm rounded-md border border-zinc-600 text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

/** Returns true if the user has accepted analytics cookies */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) === 'accepted';
}
