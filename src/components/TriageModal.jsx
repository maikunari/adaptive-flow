import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';

export default function TriageModal({ triageTask, planned, executeTradeOff, onClose, formatMinutes, totalPlannedMinutes, dailyCapacity }) {
  const incomingDuration = parseInt(triageTask.duration, 10) || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/60 backdrop-blur-2xl flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-lg rounded-3xl p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 text-center relative"
        role="dialog"
        aria-label="Triage task"
      >
        <button onClick={onClose} aria-label="Close triage" className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>
        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ArrowRight size={32} />
        </div>
        <h3 className="text-3xl font-semibold mb-3 tracking-tight">Re-calibrate</h3>
        <p className="text-gray-400 mb-4 text-lg font-medium">
          To make room for <span className="text-[#1D1D1F] font-semibold">"{triageTask.text}" ({formatMinutes(incomingDuration)})</span>, what will you move back to the orbit?
        </p>
        <p className="text-xs text-gray-300 font-semibold uppercase tracking-wider mb-8">
          {formatMinutes(totalPlannedMinutes)} / {formatMinutes(dailyCapacity)} used · needs {formatMinutes(incomingDuration)} more
        </p>
        <div className="grid gap-3 mb-10">
          {planned.map((task) => (
            <button
              key={task.id}
              onClick={() => executeTradeOff(task.id)}
              className="w-full p-5 rounded-2xl border border-gray-100 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left font-medium flex justify-between items-center group"
            >
              <span className="text-lg">{task.text}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-tighter">{formatMinutes(task.duration)}</span>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
              </div>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors font-semibold text-sm uppercase tracking-widest">
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}
