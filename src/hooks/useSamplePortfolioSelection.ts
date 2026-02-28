'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'vettr_sample_portfolio_id';

interface UseSamplePortfolioSelectionReturn {
  selectedId: string | null;
  select: (id: string) => void;
  isHydrated: boolean;
}

/**
 * Hook to manage the user's sample portfolio selection in localStorage.
 * Once selected, the choice is PERMANENT — no clear/change function.
 * The sample portfolio can only be replaced by connecting a real portfolio.
 */
export function useSamplePortfolioSelection(): UseSamplePortfolioSelectionReturn {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Read from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setSelectedId(stored);
    } catch {
      // localStorage not available (SSR or incognito with restrictions)
    }
    setIsHydrated(true);
  }, []);

  const select = useCallback((id: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // silent
    }
    setSelectedId(id);
  }, []);

  return { selectedId, select, isHydrated };
}
