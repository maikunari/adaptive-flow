import React from 'react';
import { motion } from 'framer-motion';
import { Undo2, CheckCircle2 } from 'lucide-react';

export default function UndoToast({ task, source, variant = 'removed', onUndo, onDismiss }) {
  const isCompletion = variant === 'completed';
  const sourceLabel = source === 'planned' ? 'Intent' : source === 'orbit' ? 'Orbit' : '';
  const message = isCompletion
    ? `"${task.text}" completed`
    : `Removed from ${sourceLabel}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
    >
      <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-lg ${isCompletion ? 'bg-emerald-900' : 'bg-[#1D1D1F]'} text-white`}>
        {isCompletion && <CheckCircle2 size={14} className="text-emerald-300 flex-shrink-0" />}
        <span className="text-sm font-medium truncate max-w-[220px]">{message}</span>
        <button
          onClick={onUndo}
          aria-label={isCompletion ? 'Undo completion' : 'Undo removal'}
          className={`flex items-center gap-2 text-sm font-semibold transition-colors ${isCompletion ? 'text-emerald-300 hover:text-white' : 'text-indigo-300 hover:text-white'}`}
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
