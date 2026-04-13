import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AuthScreen({ onMagicLink, onGuest }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const { error: authError } = await onMagicLink(email);
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <h1 className="text-5xl font-semibold tracking-tight text-[#1D1D1F] mb-3">Adaptive Flow</h1>
        <p className="text-gray-400 font-medium mb-12">Plan with intention. Adapt without guilt.</p>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Check your email</h2>
            <p className="text-gray-400">
              We sent a magic link to <span className="text-[#1D1D1F] font-medium">{email}</span>
            </p>
            <p className="text-sm text-gray-300">Click the link to sign in. You can close this tab.</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-white border border-gray-100 rounded-3xl p-5 pl-14 text-lg focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all outline-none shadow-sm placeholder:text-gray-300"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                  <Mail size={20} />
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full p-5 rounded-3xl bg-[#1D1D1F] text-white font-semibold hover:bg-[#2D2D2F] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send magic link'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#FBFBFD] px-4 text-xs text-gray-300 uppercase tracking-widest font-semibold">or</span>
              </div>
            </div>

            <button
              onClick={onGuest}
              className="w-full p-4 rounded-3xl text-gray-400 hover:text-gray-600 font-medium transition-colors text-sm"
            >
              Continue without an account
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
