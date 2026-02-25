'use client';

import { useAiAgentUsage } from '@/hooks/useAiAgentUsage';

interface AiAgentButtonProps {
  isOpen?: boolean;
  onClick?: () => void;
}

export function AiAgentButton({ isOpen = false, onClick }: AiAgentButtonProps) {
  const { usage } = useAiAgentUsage();

  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={isOpen ? 'Close VETTR AI assistant' : 'Open VETTR AI assistant'}
      className="fixed bottom-24 right-4 md:bottom-6 md:right-6 w-14 h-14 rounded-full bg-vettr-dark border border-white/10 shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-vettr-accent focus:ring-offset-2 focus:ring-offset-vettr-navy transition-all z-40 group"
      style={{
        animation: isOpen ? 'none' : 'breathe 3s ease-in-out infinite',
      }}
    >
      {/* Sparkle/Brain Icon (when closed) or X icon (when open) */}
      {isOpen ? (
        <svg
          className="w-6 h-6 text-vettr-accent"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ) : (
        <svg
          className="w-6 h-6 text-vettr-accent"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Brain/Sparkle icon - using a sparkle/star design */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      )}

      {/* Remaining questions badge */}
      {!isOpen && usage && usage.remaining > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-vettr-accent text-vettr-navy text-xs font-bold flex items-center justify-center shadow-md">
          {usage.remaining}
        </span>
      )}

      {/* CSS Animation for breathing pulse */}
      <style jsx>{`
        @keyframes breathe {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }
      `}</style>
    </button>
  );
}
