import React from 'react';

interface FinancialDisclaimerProps {
  variant?: 'banner' | 'inline';
  className?: string;
}

export function FinancialDisclaimer({ variant = 'banner', className = '' }: FinancialDisclaimerProps) {
  if (variant === 'inline') {
    return (
      <p className={`text-xs text-zinc-500 ${className}`}>
        For informational purposes only. Not financial advice.
      </p>
    );
  }

  return (
    <div className={`w-full bg-amber-950/30 border border-amber-800/40 rounded-md px-3 py-2 ${className}`}>
      <p className="text-xs text-amber-300/80 text-center">
        ⚠️ For informational and educational purposes only. Not financial advice. Consult a qualified
        financial advisor before making investment decisions.
      </p>
    </div>
  );
}
