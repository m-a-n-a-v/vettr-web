'use client';

import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import Modal from './ui/Modal';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-4">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Use these keyboard shortcuts to navigate VETTR quickly and efficiently.
        </p>

        <div className="space-y-2">
          {KEYBOARD_SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-white/5 last:border-b-0"
            >
              <span className="text-gray-900 dark:text-white">{shortcut.description}</span>
              <kbd className="px-3 py-1 text-sm font-mono bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-gray-500 dark:text-gray-400">
                {shortcut.display}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/5">
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Keyboard shortcuts are only active on desktop and won&apos;t interfere
            when you&apos;re typing in input fields.
          </p>
        </div>
      </div>
    </Modal>
  );
}
