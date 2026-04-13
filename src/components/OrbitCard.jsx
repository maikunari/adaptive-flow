import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Trash2, Clock } from 'lucide-react';

export default function OrbitCard({
  task,
  editingId,
  editValue,
  setEditValue,
  saveDuration,
  startEditing,
  editingTextId,
  editTextValue,
  setEditTextValue,
  startEditingText,
  saveText,
  attemptTriage,
  deleteOrbit,
  formatMinutes,
}) {
  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-orange-400' : 'bg-gray-300'}`} />
        {editingTextId === task.id ? (
          <input
            type="text"
            autoFocus
            className="text-lg font-medium outline-none bg-indigo-50 rounded px-2 py-1 min-w-0 flex-1"
            value={editTextValue}
            onChange={(e) => setEditTextValue(e.target.value)}
            onBlur={saveText}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveText();
              if (e.key === 'Escape') saveText();
            }}
            aria-label="Edit task name"
          />
        ) : (
          <span
            onClick={() => startEditingText(task)}
            className="text-lg font-medium truncate cursor-text hover:text-gray-600 transition-colors"
          >
            {task.text}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        {editingId === task.id ? (
          <input
            type="number"
            min="0"
            autoFocus
            className="w-16 text-right text-xs font-semibold text-indigo-600 outline-none bg-indigo-50 rounded px-2 py-1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveDuration}
            onKeyDown={(e) => e.key === 'Enter' && saveDuration()}
            aria-label="Edit task duration in minutes"
          />
        ) : (
          <button
            onClick={() => startEditing(task)}
            aria-label={`Edit duration: ${formatMinutes(task.duration)}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 uppercase tracking-tighter hover:text-gray-500 hover:underline underline-offset-2 transition-colors cursor-pointer"
          >
            {formatMinutes(task.duration)}
            <Clock size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
          </button>
        )}
        <button
          onClick={() => attemptTriage(task)}
          aria-label={`Move "${task.text}" to Intent`}
          className="p-3 bg-gray-50 rounded-full text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all"
        >
          <ArrowRight size={20} />
        </button>
        <button
          onClick={() => deleteOrbit(task.id)}
          aria-label={`Delete task: ${task.text}`}
          className="opacity-0 group-hover:opacity-100 p-3 text-gray-300 hover:text-red-400 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}
