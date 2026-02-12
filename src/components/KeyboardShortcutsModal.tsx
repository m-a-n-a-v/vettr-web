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
        <p className="text-textSecondary text-sm">
          Use these keyboard shortcuts to navigate VETTR quickly and efficiently.
        </p>

        <div className="space-y-2">
          {KEYBOARD_SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
            >
              <span className="text-textPrimary">{shortcut.description}</span>
              <kbd className="px-3 py-1 text-sm font-mono bg-primaryLight border border-border rounded text-textSecondary">
                {shortcut.display}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-textMuted text-xs">
            Keyboard shortcuts are only active on desktop and won&apos;t interfere
            when you&apos;re typing in input fields.
          </p>
        </div>
      </div>
    </Modal>
  );
}
