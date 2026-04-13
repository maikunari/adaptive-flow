import React from 'react';
import { motion } from 'framer-motion';
import { Settings2, X } from 'lucide-react';

export default function SettingsModal({ dailyCapacity, setDailyCapacity, sunsetTime, setSunsetTime, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/60 backdrop-blur-2xl flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-md rounded-3xl p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 text-center relative"
        role="dialog"
        aria-label="Settings"
      >
        <button onClick={onClose} aria-label="Close settings" className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>
        <div className="w-16 h-16 bg-gray-50 text-gray-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Settings2 size={32} />
        </div>
        <h3 className="text-3xl font-semibold mb-8 tracking-tight">Personalize</h3>
        <div className="space-y-8 mb-10">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block">Daily Capacity (mins)</label>
            <input
              type="number"
              min="0"
              value={dailyCapacity}
              onChange={(e) => setDailyCapacity(Math.max(0, parseInt(e.target.value, 10) || 0))}
              aria-label="Daily capacity in minutes"
              className="text-center text-3xl font-semibold w-full outline-none border-b border-gray-100 pb-2 text-indigo-600"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block">Sunset Ritual Time</label>
            <input
              type="time"
              value={sunsetTime}
              onChange={(e) => setSunsetTime(e.target.value)}
              aria-label="Sunset ritual time"
              className="text-center text-3xl font-semibold w-full outline-none border-b border-gray-100 pb-2 text-amber-600"
            />
          </div>
        </div>
        <button onClick={onClose} className="w-full p-5 rounded-3xl bg-[#1D1D1F] text-white font-semibold hover:bg-[#2D2D2F] transition-all">
          Done
        </button>
      </motion.div>
    </motion.div>
  );
}
