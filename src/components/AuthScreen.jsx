import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';

const CYCLE_MS = 3500;

const allIntentTasks = [
  { id: 'i1', text: 'Write project proposal', duration: '2h' },
  { id: 'i2', text: 'Review pull requests', duration: '45m' },
  { id: 'i3', text: 'Call with accountant', duration: '30m' },
];

const allOrbitTasks = [
  { id: 'o1', text: 'Client wants changes by EOD', priority: 'high' },
  { id: 'o2', text: 'New bug report from QA', priority: 'high' },
];

function useAnimationCycle() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // First transition happens faster
    const firstDelay = phase === 0 ? 2500 : CYCLE_MS;
    const timer = setTimeout(() => {
      setPhase((p) => (p + 1) % 3);
    }, firstDelay);
    return () => clearTimeout(timer);
  }, [phase]);

  let intent, orbit;
  if (phase === 0) {
    intent = allIntentTasks;
    orbit = allOrbitTasks;
  } else if (phase === 1) {
    intent = [allOrbitTasks[0], allIntentTasks[0], allIntentTasks[1]];
    orbit = [allIntentTasks[2], allOrbitTasks[1]];
  } else {
    intent = allIntentTasks;
    orbit = allOrbitTasks;
  }

  return { intent, orbit, phase };
}

export default function AuthScreen({ onMagicLink, onGuest }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { intent, orbit, phase } = useAnimationCycle();

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
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-[#FBFBFD] to-[#FBFBFD] flex flex-col items-center justify-center p-6 md:p-12 font-sans">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl text-center mb-14"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500/70 mb-4">Task management, reimagined</p>
        <h1 className="text-6xl md:text-7xl font-semibold tracking-tight text-[#1D1D1F] mb-5">Adaptive Flow</h1>
        <p className="text-xl text-gray-500 font-medium mb-4">Plan with intention. Adapt without guilt.</p>
        <p className="text-base text-gray-400 max-w-md mx-auto leading-relaxed">
          The task manager where adding means choosing. Every <span className="text-[#1D1D1F] font-semibold">"yes"</span> requires a <span className="text-[#1D1D1F] font-semibold">"no."</span>
        </p>
      </motion.div>

      {/* Animated product preview */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-2xl mb-14"
      >
        <div className="bg-white/70 border border-gray-100 rounded-3xl p-6 md:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-2 gap-6 md:gap-8">
            {/* Intent preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-base font-semibold tracking-tight text-[#1D1D1F]">Intent</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Your plan</span>
              </div>
              <AnimatePresence mode="popLayout">
                {intent.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, x: task.id.startsWith('o') ? 80 : 0, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 80, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={`border rounded-xl p-3.5 flex items-center justify-between transition-colors ${
                      task.id.startsWith('o') && phase === 1
                        ? 'bg-indigo-50/50 border-indigo-200'
                        : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        task.id.startsWith('o') && phase === 1 ? 'border-indigo-300' : 'border-gray-200'
                      }`} />
                      <span className="text-sm font-medium text-gray-600">{task.text}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-300 uppercase">{task.duration || '30m'}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Orbit preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-base font-semibold tracking-tight text-[#1D1D1F]">Orbit</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Interruptions</span>
              </div>
              <AnimatePresence mode="popLayout">
                {orbit.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, x: task.id.startsWith('i') ? -80 : 0, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -80, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={`border rounded-xl p-3.5 flex items-center justify-between transition-colors ${
                      task.id.startsWith('i') && phase === 1
                        ? 'bg-orange-50/50 border-orange-200'
                        : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${(task.priority === 'high' || task.id.startsWith('i')) ? 'bg-orange-400' : 'bg-gray-300'}`} />
                      <span className="text-sm font-medium text-gray-600">{task.text}</span>
                    </div>
                    <ArrowRight size={14} className="text-gray-300" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Annotation */}
          <AnimatePresence mode="wait">
            {phase === 1 ? (
              <motion.p
                key="swap"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-indigo-400 text-center mt-5 font-medium"
              >
                ← Urgent task pushed in. Low-priority bumped out. →
              </motion.p>
            ) : (
              <motion.p
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-gray-300 text-center mt-5 font-medium"
              >
                Your day has a limit. The app enforces it.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Value props */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-8 mb-14 text-center"
      >
        <div>
          <p className="text-sm font-semibold text-[#1D1D1F]">Forced trade-offs</p>
          <p className="text-xs text-gray-400">No silent overloading</p>
        </div>
        <div className="w-px bg-gray-200" />
        <div>
          <p className="text-sm font-semibold text-[#1D1D1F]">Sunset ritual</p>
          <p className="text-xs text-gray-400">Close your day with intention</p>
        </div>
        <div className="w-px bg-gray-200" />
        <div>
          <p className="text-sm font-semibold text-[#1D1D1F]">Capacity aware</p>
          <p className="text-xs text-gray-400">Your time is finite</p>
        </div>
      </motion.div>

      {/* Auth form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm"
      >
        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 text-center"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Check your email</h2>
            <p className="text-gray-500">
              We sent a magic link to <span className="text-[#1D1D1F] font-medium">{email}</span>
            </p>
            <p className="text-sm text-gray-400">Click the link to sign in. You can close this tab.</p>
          </motion.div>
        ) : (
          <div className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-white border border-gray-200 rounded-3xl p-5 pl-14 text-lg focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all outline-none shadow-sm placeholder:text-gray-300"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
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
                {loading ? 'Sending...' : 'Get started free'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="text-xs text-gray-300 text-center">No password needed. We'll email you a magic link.</p>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gradient-to-b from-[#FBFBFD] to-[#FBFBFD] px-4 text-xs text-gray-300 uppercase tracking-widest font-semibold">or</span>
              </div>
            </div>

            <button
              onClick={onGuest}
              className="w-full p-4 rounded-3xl text-gray-500 hover:text-gray-700 font-medium transition-colors text-sm"
            >
              Try it without an account
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
