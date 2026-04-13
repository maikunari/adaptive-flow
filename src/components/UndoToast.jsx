import React from 'react';
import { motion } from 'framer-motion';
import { Undo2 } from 'lucide-react';

export default function UndoToast({ task, onUndo, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-4 bg-[#1D1D1F] text-white px-6 py-4 rounded-2xl shadow-lg">
        <span className="text-sm font-medium truncate max-w-[200px]">"{task.text}" removed</span>
        <button
          onClick={onUndo}
          aria-label="Undo removal"
          className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors text-sm font-semibold"
        >
          <Undo2 size={14} />
          Undo
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-gray-500 hover:text-gray-300 transition-colors text-xs"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}
