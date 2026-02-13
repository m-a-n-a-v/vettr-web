'use client';

import React, { createContext, useContext, useState } from 'react';

interface QuickSearchContextType {
  isOpen: boolean;
  openQuickSearch: () => void;
  closeQuickSearch: () => void;
}

const QuickSearchContext = createContext<QuickSearchContextType | undefined>(undefined);

export function QuickSearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openQuickSearch = () => setIsOpen(true);
  const closeQuickSearch = () => setIsOpen(false);

  return (
    <QuickSearchContext.Provider value={{ isOpen, openQuickSearch, closeQuickSearch }}>
      {children}
    </QuickSearchContext.Provider>
  );
}

export function useQuickSearch() {
  const context = useContext(QuickSearchContext);
  if (context === undefined) {
    throw new Error('useQuickSearch must be used within a QuickSearchProvider');
  }
  return context;
}
