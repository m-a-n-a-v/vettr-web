/**
 * usePullToRefresh Hook
 *
 * Implements pull-to-refresh gesture for mobile devices.
 * Tracks touch events to determine when user has pulled down to trigger refresh.
 */

import { useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  enabled?: boolean; // Only enable on mobile
  threshold?: number; // How far user must pull down (in pixels)
}

interface UsePullToRefreshResult {
  isPulling: boolean;
  pullDistance: number;
}

/**
 * Hook to implement pull-to-refresh gesture on mobile
 */
export function usePullToRefresh(options: UsePullToRefreshOptions): UsePullToRefreshResult {
  const { onRefresh, enabled = true, threshold = 80 } = options;
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef<number>(0);
  const isRefreshing = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull-to-refresh when scrolled to top
      if (window.scrollY > 0) return;

      startY = e.touches[0].clientY;
      touchStartY.current = startY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Only proceed if we're at the top of the page
      if (window.scrollY > 0 || isRefreshing.current) return;

      currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      // Only track downward pulls
      if (distance > 0) {
        // Dampen the pull distance for a more natural feel
        const dampened = Math.min(distance * 0.5, threshold * 1.5);
        setPullDistance(dampened);
        setIsPulling(dampened >= threshold);

        // Prevent default scroll behavior when pulling
        if (dampened > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (isPulling && !isRefreshing.current) {
        isRefreshing.current = true;
        try {
          await onRefresh();
        } catch (error) {
          console.error('Pull-to-refresh failed:', error);
        } finally {
          isRefreshing.current = false;
        }
      }

      // Reset state
      setPullDistance(0);
      setIsPulling(false);
      startY = 0;
      currentY = 0;
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, threshold, isPulling, onRefresh]);

  return {
    isPulling,
    pullDistance,
  };
}
