import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';

// Animation sequence: orbit task moves to intent, bumps one out
const CYCLE_MS = 5000;

const allIntentTasks = [
  { id: 'i1', text: 'Write project proposal', duration: '2h' },
  { id: 'i2', text: 'Review pull requests', duration: '45m' },
  { id: 'i3', text: 'Call with accountant', duration: '30m' },
];

const allOrbitTasks = [
  { id: 'o1', text: 'Client wants changes by EOD', priority: 'high' },
  { id: 'o2', text: 'New bug report from QA', priority: 'high' },
];

// Cycle through 3 states:
// 0: initial (3 intent, 2 orbit)
// 1: orbit[0] moves to intent, intent[2] bumps out (3 intent, 1 orbit + 1 bumped)
// 2: reset back to initial
function useAnimationCycle() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((p) => (p + 1) % 3);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, []);

  let intent, orbit;
  if (phase === 0) {
    intent = allIntentTasks;
    orbit = allOrbitTasks;
  } else if (phase === 1) {
    // o1 moved to intent, i3 bumped to orbit
    intent = [allOrbitTasks[0], allIntentTasks[0], allIntentTasks[1]];
    orbit = [allIntentTasks[2], allOrbitTasks[1]];
  } else {
    // back to normal
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
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col items-center justify-center p-6 font-sans">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center mb-16"
      >
        <h1 className="text-5xl font-semibold tracking-tight text-[#1D1D1F] mb-3">Adaptive Flow</h1>
        <p className="text-gray-400 font-medium mb-4">Plan with intention. Adapt without guilt.</p>
        <p className="text-sm text-gray-300">The only task manager that forces a trade-off when your day is full. Every "yes" requires a "no."</p>
      </motion.div>

      {/* Animated product preview */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-2xl grid grid-cols-2 gap-8 mb-16"
      >
        {/* Intent preview */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold tracking-tight text-[#1D1D1F] mb-1">Intent</h3>
          <div className="flex items-center gap-2 opacity-40 mb-2">
            <Calendar size={12} strokeWidth={2.5} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Today's Focus</span>
          </div>
          <AnimatePresence mode="popLayout">
            {intent.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: task.id.startsWith('o') ? 100 : 0, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`bg-white border rounded-2xl p-4 flex items-center justify-between ${
                  task.id.startsWith('o') && phase === 1 ? 'border-indigo-200 shadow-sm' : 'border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                  <span className="text-sm font-medium text-gray-600">{task.text}</span>
                </div>
                <span className="text-[10px] font-semibold text-gray-300 uppercase">{task.duration || '30m'}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Orbit preview */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold tracking-tight text-[#1D1D1F] mb-1">Orbit</h3>
          <div className="flex items-center gap-2 opacity-40 mb-2">
            <AlertCircle size={12} strokeWidth={2.5} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Incoming</span>
          </div>
          <AnimatePresence mode="popLayout">
            {orbit.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: task.id.startsWith('i') ? -100 : 0, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`bg-white border rounded-2xl p-4 flex items-center justify-between ${
                  task.id.startsWith('i') && phase === 1 ? 'border-orange-200' : 'border-gray-100'
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
          <AnimatePresence>
            {phase === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-gray-300 text-center pt-2 italic"
              >
                Watch: tasks swap between columns automatically
              </motion.p>
            )}
          </AnimatePresence>
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
