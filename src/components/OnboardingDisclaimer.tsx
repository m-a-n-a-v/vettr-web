'use client';

import { useState, useEffect } from 'react';

const DISCLAIMER_KEY = 'vettr_disclaimer_accepted';
const DISCLAIMER_VERSION = '1.0';

export function OnboardingDisclaimer() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(DISCLAIMER_KEY);
    if (accepted !== DISCLAIMER_VERSION) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(DISCLAIMER_KEY, DISCLAIMER_VERSION);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl max-w-md w-full p-8 flex flex-col gap-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-8 h-8 text-amber-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 id="disclaimer-title" className="text-xl font-bold text-white mb-2">
            Important Legal Notice
          </h2>
          <p className="text-sm text-zinc-400">
            Before using VETTR, please read and acknowledge the following
          </p>
        </div>

        {/* Body */}
        <div className="text-sm text-zinc-300 space-y-3 leading-relaxed">
          <p>
            The information provided by <strong className="text-white">VETTR</strong> is for{' '}
            <strong className="text-amber-300">educational and informational purposes only</strong> and does
            not constitute professional advice to buy or sell any securities.
          </p>
          <p>
            VETTR&apos;s analysis is based on publicly available data processed by artificial
            intelligence. Past performance is not indicative of future results.
          </p>
          <p>
            Always consult a <strong className="text-white">qualified financial advisor</strong> before
            making investment decisions. VETTR is not registered as an investment advisor under Canadian
            securities laws.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleAccept}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          I Understand — Continue to VETTR
        </button>

        <p className="text-xs text-zinc-500 text-center">
          By continuing, you confirm you have read and understood this disclaimer.
        </p>
      </div>
    </div>
  );
}
