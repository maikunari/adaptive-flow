import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Trash2 } from 'lucide-react';

export default function TaskCard({
  task,
  index,
  selectedIndex,
  editingId,
  editValue,
  setEditValue,
  saveDuration,
  startEditing,
  completeTask,
  deletePlanned,
  handleDragEnd,
  formatMinutes,
}) {
  return (
    <motion.div
      layout
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      dragMomentum={false}
      onDragEnd={(e, info) => handleDragEnd(e, info, task, 'planned')}
      whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', cursor: 'grabbing' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`group bg-white border p-5 rounded-[28px] shadow-sm transition-all flex items-center justify-between cursor-grab ${
        selectedIndex === index
          ? 'border-blue-400 ring-2 ring-blue-100 shadow-md'
          : 'border-gray-100 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => completeTask(task.id)}
          aria-label={`Complete task: ${task.text}`}
          className="text-gray-300 hover:text-blue-500 transition-colors"
        >
          <CheckCircle2 size={24} />
        </button>
        <span className="text-lg font-medium">{task.text}</span>
      </div>
      <div className="flex items-center gap-4">
        {editingId === task.id ? (
          <input
            type="number"
            min="0"
            autoFocus
            className="w-16 text-right text-xs font-semibold text-blue-600 outline-none bg-blue-50 rounded px-2 py-1"
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
            className="text-xs font-semibold text-gray-300 uppercase tracking-tighter hover:text-gray-500 transition-colors cursor-text"
          >
            {formatMinutes(task.duration)}
          </button>
        )}
        <button
          onClick={() => deletePlanned(task.id)}
          aria-label={`Delete task: ${task.text}`}
          className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-400 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}
