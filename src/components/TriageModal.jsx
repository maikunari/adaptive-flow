import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';

export default function TriageModal({ triageTask, planned, executeTradeOff, onClose }) {
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
        className="bg-white w-full max-w-lg rounded-[48px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 text-center relative"
        role="dialog"
        aria-label="Triage task"
      >
        <button onClick={onClose} aria-label="Close triage" className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ArrowRight size={32} />
        </div>
        <h3 className="text-3xl font-semibold mb-3 tracking-tight">Re-calibrate</h3>
        <p className="text-gray-400 mb-10 text-lg font-medium">
          To make room for <span className="text-black font-semibold">"{triageTask.text}"</span>, what will you move back to the orbit?
        </p>
        <div className="grid gap-3 mb-10">
          {planned.map((task) => (
            <button
              key={task.id}
              onClick={() => executeTradeOff(task.id)}
              className="w-full p-5 rounded-3xl border border-gray-100 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left font-medium flex justify-between items-center group"
            >
              <span className="text-lg">{task.text}</span>
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
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
