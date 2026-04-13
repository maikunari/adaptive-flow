import React from 'react';
import { motion } from 'framer-motion';
import { Moon, CheckCircle2, X } from 'lucide-react';

export default function SunsetModal({ sunsetQueue, completedToday, processSunsetTask, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-amber-900/20 backdrop-blur-3xl flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-lg rounded-3xl p-12 shadow-2xl text-center border border-amber-100 relative"
        role="dialog"
        aria-label="Sunset review"
      >
        <button onClick={onClose} aria-label="Close sunset review" className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>
        {sunsetQueue.length > 0 ? (
          <>
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Moon size={32} />
            </div>
            <h3 className="text-3xl font-semibold mb-3 tracking-tight">Sunset Review</h3>
            {completedToday > 0 && (
              <p className="text-emerald-500 text-sm font-semibold mb-4">
                {completedToday} task{completedToday !== 1 ? 's' : ''} completed today
              </p>
            )}
            <p className="text-gray-400 mb-10 text-lg font-medium">
              You didn't finish <span className="text-[#1D1D1F] font-semibold">"{sunsetQueue[0].text}"</span>. What happens to it?
            </p>
            <div className="grid gap-3">
              <button onClick={() => processSunsetTask(sunsetQueue[0], 'carry')} className="w-full p-5 rounded-3xl bg-[#1D1D1F] text-white font-semibold hover:bg-[#2D2D2F] transition-all">
                Keep for Tomorrow
              </button>
              <button onClick={() => processSunsetTask(sunsetQueue[0], 'orbit')} className="w-full p-5 rounded-3xl border border-gray-100 hover:border-amber-400 hover:bg-amber-50 transition-all font-medium">
                Return to Orbit
              </button>
              <button onClick={() => processSunsetTask(sunsetQueue[0], 'discard')} className="w-full p-5 rounded-3xl text-gray-400 hover:text-red-500 transition-all font-medium">
                Discard
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-3xl font-semibold mb-3 tracking-tight">Day Closed</h3>
            {completedToday > 0 && (
              <p className="text-emerald-500 text-sm font-semibold mb-4">
                You completed {completedToday} task{completedToday !== 1 ? 's' : ''} today
              </p>
            )}
            <p className="text-gray-400 mb-10 text-lg font-medium">Your mind is clear. Rest now.</p>
            <button onClick={onClose} className="w-full p-5 rounded-3xl bg-[#1D1D1F] text-white font-semibold hover:bg-[#2D2D2F] transition-all">
              Rest Now
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
