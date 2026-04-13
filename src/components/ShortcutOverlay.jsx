import React from 'react';
import { motion } from 'framer-motion';

const shortcuts = [
  { keys: ['⌘', 'J'], label: 'Plan a task' },
  { keys: ['⌘', 'K'], label: 'Capture distraction' },
  { keys: ['↑', '↓'], label: 'Navigate tasks' },
  { keys: ['Enter'], label: 'Complete selected' },
  { keys: ['⌘', '↑↓'], label: 'Reorder tasks' },
  { keys: ['Esc'], label: 'Close modals' },
  { keys: ['⌘', '/'], label: 'This help' },
];

export default function ShortcutOverlay({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-[#1D1D1F]/40 backdrop-blur-xl flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-sm rounded-3xl p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-gray-100"
        role="dialog"
        aria-label="Keyboard shortcuts"
      >
        <h3 className="text-xl font-semibold tracking-tight mb-6 text-center">Keyboard Shortcuts</h3>
        <div className="space-y-4">
          {shortcuts.map(({ keys, label }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{label}</span>
              <div className="flex items-center gap-1">
                {keys.map((key) => (
                  <kbd
                    key={key}
                    className="min-w-[28px] h-7 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 px-2"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-300 text-center mt-8">Press Esc to close</p>
      </motion.div>
    </motion.div>
  );
}
