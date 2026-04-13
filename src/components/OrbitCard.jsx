import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';

export default function OrbitCard({
  task,
  editingId,
  editValue,
  setEditValue,
  saveDuration,
  startEditing,
  attemptTriage,
  deleteOrbit,
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
      onDragEnd={(e, info) => handleDragEnd(e, info, task, 'orbit')}
      whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', cursor: 'grabbing' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all cursor-grab"
    >
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-orange-400' : 'bg-gray-300'}`} />
        <span className="text-lg font-medium">{task.text}</span>
      </div>
      <div className="flex items-center gap-3">
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
          onClick={() => attemptTriage(task)}
          aria-label={`Move "${task.text}" to Intent`}
          className="p-3 bg-gray-50 rounded-full text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all"
        >
          <ArrowRight size={20} />
        </button>
        <button
          onClick={() => deleteOrbit(task.id)}
          aria-label={`Delete task: ${task.text}`}
          className="p-3 text-gray-300 hover:text-red-400 transition-all"
        >
          <X size={20} />
        </button>
      </div>
    </motion.div>
  );
}
