import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Trash2, Check, Clock } from 'lucide-react';

export default function TaskCard({
  task,
  index,
  selectedIndex,
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
  completeTask,
  deletePlanned,
  formatMinutes,
}) {
  const [completing, setCompleting] = useState(false);

  const handleComplete = () => {
    setCompleting(true);
    setTimeout(() => completeTask(task.id), 500);
  };

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={
        completing
          ? { opacity: 0, scale: 1.04, backgroundColor: 'rgba(220, 252, 231, 1)' }
          : { opacity: 1, scale: 1 }
      }
      exit={{ opacity: 0, scale: 0.9 }}
      className={`group bg-white border p-5 rounded-2xl shadow-sm transition-all flex items-center justify-between ${
        completing
          ? 'border-emerald-300 shadow-emerald-100 shadow-md'
          : selectedIndex === index
            ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-md'
            : 'border-gray-100 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <button
          onClick={handleComplete}
          disabled={completing}
          aria-label={`Complete task: ${task.text}`}
          className={`flex-shrink-0 transition-colors ${
            completing
              ? 'text-emerald-500'
              : 'text-gray-300 hover:text-indigo-500'
          }`}
        >
          {completing ? (
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <Check size={24} strokeWidth={3} />
            </motion.div>
          ) : (
            <CheckCircle2 size={24} />
          )}
        </button>
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
            onClick={() => !completing && startEditingText(task)}
            className={`text-lg font-medium transition-colors truncate cursor-text ${completing ? 'text-emerald-700 line-through' : 'hover:text-gray-600'}`}
          >
            {task.text}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
        {!completing && (
          <>
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
              onClick={() => deletePlanned(task.id)}
              aria-label={`Delete task: ${task.text}`}
              className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-400 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
