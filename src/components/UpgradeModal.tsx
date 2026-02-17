'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { StarFilledIcon } from '@/components/icons';

interface TierOption {
  tier: string;
  name: string;
  price: string;
  period: string;
  watchlistLimit: string;
  pulseDelay: string;
  syncInterval: string;
  features: string[];
  highlighted: boolean;
  current: boolean;
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: 'free' | 'pro' | 'premium';
  currentCount?: number;
  currentLimit?: number;
}

const TIER_DATA: Record<string, Omit<TierOption, 'highlighted' | 'current'>> = {
  free: {
    tier: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    watchlistLimit: '5 stocks',
    pulseDelay: '12-hour delay',
    syncInterval: '24-hour sync',
    features: [
      'Up to 5 watchlist stocks',
      'VETTR Score access',
      'Basic pulse dashboard',
      'Stock discovery collections',
    ],
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    watchlistLimit: '25 stocks',
    pulseDelay: '4-hour delay',
    syncInterval: '12-hour sync',
    features: [
      'Up to 25 watchlist stocks',
      'VETTR Score with full breakdown',
      'Faster pulse updates (4hr)',
      'Priority stock data sync',
      'CSV export',
    ],
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    price: '$24.99',
    period: '/month',
    watchlistLimit: 'Unlimited',
    pulseDelay: 'Real-time',
    syncInterval: '4-hour sync',
    features: [
      'Unlimited watchlist stocks',
      'Full VETTR Score analytics',
      'Real-time pulse updates',
      'Priority data sync (4hr)',
      'CSV export',
      'Early access to new features',
    ],
  },
};

export default function UpgradeModal({
  isOpen,
  onClose,
  currentTier,
  currentCount,
  currentLimit,
}: UpgradeModalProps) {
  // Determine which tiers to show (current + higher tiers)
  const tierOrder: ('free' | 'pro' | 'premium')[] = ['free', 'pro', 'premium'];
  const currentIndex = tierOrder.indexOf(currentTier);

  // Show tiers from current onwards
  const visibleTiers = tierOrder.slice(currentIndex).map((tier) => ({
    ...TIER_DATA[tier],
    current: tier === currentTier,
    highlighted: tier === tierOrder[currentIndex + 1], // highlight next tier up
  }));

  // If user is already premium, show nothing meaningful
  if (currentTier === 'premium') {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upgrade Your Plan"
      size="lg"
    >
      <div className="space-y-4">
        {/* Limit reached message */}
        {currentCount !== undefined && currentLimit !== undefined && (
          <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4 text-center">
            <p className="text-yellow-400 text-sm font-medium">
              You&apos;ve reached your watchlist limit ({currentCount}/{currentLimit} stocks)
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Upgrade to track more stocks and unlock additional features
            </p>
          </div>
        )}

        {/* Tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleTiers.map((tier) => (
            <div
              key={tier.tier}
              className={`relative rounded-2xl p-5 border transition-all ${
                tier.current
                  ? 'bg-white/5 border-white/10 opacity-75'
                  : tier.highlighted
                  ? 'bg-vettr-accent/5 border-vettr-accent/30 ring-1 ring-vettr-accent/20'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Current badge */}
              {tier.current && (
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white/10 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                </div>
              )}

              {/* Recommended badge */}
              {tier.highlighted && (
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-vettr-accent bg-vettr-accent/10 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>
              )}

              {/* Tier name */}
              <h3 className={`text-lg font-bold mb-1 ${
                tier.highlighted ? 'text-vettr-accent' : 'text-white'
              }`}>
                {tier.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold text-white">{tier.price}</span>
                <span className="text-sm text-gray-400">{tier.period}</span>
              </div>

              {/* Key stats */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <StarFilledIcon className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span className="text-white font-medium">{tier.watchlistLimit}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-vettr-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-400">{tier.pulseDelay}</span>
                </div>
              </div>

              {/* Features list */}
              <ul className="space-y-2 mb-4">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-vettr-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              {tier.current ? (
                <button
                  disabled
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-medium bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => {
                    // For now, show a coming soon message.
                    // In production, this would open a Stripe checkout or similar.
                    onClose();
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                    tier.highlighted
                      ? 'bg-vettr-accent text-vettr-navy hover:bg-vettr-accent/90'
                      : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                  }`}
                >
                  Upgrade to {tier.name}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-500 pt-2">
          Upgrade and downgrade anytime. Plans billed monthly.
        </p>
      </div>
    </Modal>
  );
}
