import React from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, X } from 'lucide-react';

export default function AccountModal({ user, onSignOut, onClose }) {
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
        className="bg-white w-full max-w-sm rounded-3xl p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 text-center relative"
        role="dialog"
        aria-label="Account"
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>
        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <User size={32} />
        </div>
        <h3 className="text-2xl font-semibold mb-2 tracking-tight">Account</h3>
        <p className="text-sm text-gray-400 mb-8">{user.email}</p>
        <p className="text-xs text-gray-300 mb-8">Your tasks sync across devices automatically.</p>
        <button
          onClick={onSignOut}
          className="w-full p-4 rounded-3xl border border-gray-100 hover:border-red-200 hover:bg-red-50 text-gray-500 hover:text-red-600 font-medium transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </motion.div>
    </motion.div>
  );
}
