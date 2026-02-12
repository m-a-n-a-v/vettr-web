'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface KeyboardShortcut {
  key: string;
  action: () => void;
  description: string;
  modifiers?: {
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
  };
}

export interface ShortcutConfig {
  key: string;
  display: string;
  description: string;
}

// Define all shortcuts for help modal display
export const KEYBOARD_SHORTCUTS: ShortcutConfig[] = [
  { key: 'Cmd/Ctrl+K', display: '⌘K / Ctrl+K', description: 'Open quick search' },
  { key: '1', display: '1', description: 'Navigate to Pulse' },
  { key: '2', display: '2', description: 'Navigate to Discovery' },
  { key: '3', display: '3', description: 'Navigate to Stocks' },
  { key: '4', display: '4', description: 'Navigate to Alerts' },
  { key: '5', display: '5', description: 'Navigate to Profile' },
  { key: 'Escape', display: 'Esc', description: 'Close modals and overlays' },
  { key: '?', display: '?', description: 'Show keyboard shortcuts' },
];

interface UseKeyboardShortcutsOptions {
  onOpenQuickSearch?: () => void;
  onOpenHelp?: () => void;
  onCloseModal?: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = (options: UseKeyboardShortcutsOptions = {}) => {
  const {
    onOpenQuickSearch,
    onOpenHelp,
    onCloseModal,
    enabled = true,
  } = options;

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Cmd/Ctrl+K: Open quick search (works even when typing)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onOpenQuickSearch?.();
        return;
      }

      // Don't handle other shortcuts when typing in input fields
      if (isTyping) return;

      // Escape: Close modals
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseModal?.();
        return;
      }

      // ?: Show keyboard shortcuts help
      if (event.key === '?' && event.shiftKey) {
        event.preventDefault();
        onOpenHelp?.();
        return;
      }

      // Number keys 1-5: Navigate to tabs
      const navigationMap: Record<string, string> = {
        '1': '/pulse',
        '2': '/discovery',
        '3': '/stocks',
        '4': '/alerts',
        '5': '/profile',
      };

      if (navigationMap[event.key]) {
        const targetPath = navigationMap[event.key];
        // Only navigate if not already on that page
        if (pathname !== targetPath) {
          event.preventDefault();
          router.push(targetPath);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, router, pathname, onOpenQuickSearch, onOpenHelp, onCloseModal]);

  return {
    shortcuts: KEYBOARD_SHORTCUTS,
  };
};
