import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle, Calendar, Settings2, Moon, HelpCircle } from 'lucide-react';
import { CAPACITY_WARN_THRESHOLD } from './constants';
import useTaskManager from './hooks/useTaskManager';
import TaskCard from './components/TaskCard';
import OrbitCard from './components/OrbitCard';
import SettingsModal from './components/SettingsModal';
import TriageModal from './components/TriageModal';
import SunsetModal from './components/SunsetModal';
import UndoToast from './components/UndoToast';
import ShortcutOverlay from './components/ShortcutOverlay';

const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const App = () => {
  const tm = useTaskManager();

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${tm.isClosingDay ? 'bg-[#FDF6E3]' : 'bg-[#FBFBFD]'} text-[#1D1D1F] font-sans selection:bg-indigo-100 p-6 md:p-12 flex justify-center`}>

      <div className="max-w-6xl w-full">
        {/* First-run welcome — inline, not a banner */}
        <AnimatePresence>
          {!tm.hasSeenOnboarding && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center text-sm text-gray-300 font-medium mb-10"
            >
              Plan on the left. Interruptions land on the right. When your day is full, something has to give.{' '}
              <button
                onClick={() => tm.setHasSeenOnboarding(true)}
                className="text-gray-400 hover:text-gray-500 transition-colors underline underline-offset-2"
              >
                Got it
              </button>
            </motion.p>
          )}
        </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Intent Column */}
        <section className="space-y-8">
          <header className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3 opacity-40 mb-1">
                  <Calendar size={16} strokeWidth={2.5} />
                  <span className="text-xs font-bold uppercase tracking-widest">Today's Focus</span>
                </div>
                <h1 className="text-5xl font-semibold tracking-tight">Intent</h1>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={tm.startSunset}
                  aria-label="Close day and start sunset review"
                  className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all text-gray-500 hover:text-amber-600"
                >
                  <Moon size={14} />
                  <span className="text-xs font-bold uppercase tracking-tighter">Close Day</span>
                </button>
                <button
                  onClick={() => tm.setIsSettingsOpen(true)}
                  aria-label="Open settings"
                  className={`group flex items-center gap-3 px-4 py-2 rounded-full shadow-sm transition-all border ${
                    tm.isOverCapacity
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-white border-gray-100 text-gray-600'
                  }`}
                >
                  <motion.div
                    animate={tm.isOverCapacity ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="relative w-8 h-8 rounded-full bg-gray-100 overflow-hidden border border-white"
                  >
                    <motion.div
                      className={`absolute bottom-0 left-0 right-0 transition-colors ${
                        tm.isOverCapacity
                          ? 'bg-red-500'
                          : tm.capacityPercentage > CAPACITY_WARN_THRESHOLD
                            ? 'bg-orange-400'
                            : 'bg-indigo-500'
                      }`}
                      initial={{ height: 0 }}
                      animate={{ height: `${tm.capacityPercentage}%` }}
                    />
                  </motion.div>
                  <div className="text-left">
                    <p className={`text-[10px] font-bold uppercase tracking-tighter leading-none ${tm.isOverCapacity ? 'text-red-400' : 'text-gray-400'}`}>
                      {tm.isOverCapacity ? 'Over Capacity' : 'Capacity'}
                    </p>
                    <p className="text-xs font-semibold leading-tight">
                      {tm.totalPlannedMinutes} / {tm.dailyCapacity}m
                    </p>
                  </div>
                  <Settings2 size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>
              </div>
            </div>
            <p className="text-gray-400 font-medium">The non-negotiable commitments.</p>
          </header>

          {/* Add to Intent input */}
          <form onSubmit={tm.addIntentTask} className="relative">
            <input
              ref={tm.intentInputRef}
              value={tm.intentInputValue}
              onChange={(e) => tm.setIntentInputValue(e.target.value)}
              placeholder={isTouchDevice ? "Plan your day..." : "Plan your day...  ⌘J"}
              aria-label="Add task directly to Intent"
              className="w-full bg-white border border-gray-100 rounded-3xl p-6 pl-14 text-lg focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all outline-none shadow-sm placeholder:text-gray-300"
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
              <Calendar size={20} />
            </div>
          </form>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {tm.planned.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  selectedIndex={tm.selectedIndex}
                  editingId={tm.editingId}
                  editValue={tm.editValue}
                  setEditValue={tm.setEditValue}
                  saveDuration={tm.saveDuration}
                  startEditing={tm.startEditing}
                  editingTextId={tm.editingTextId}
                  editTextValue={tm.editTextValue}
                  setEditTextValue={tm.setEditTextValue}
                  startEditingText={tm.startEditingText}
                  saveText={tm.saveText}
                  completeTask={tm.completeTask}
                  deletePlanned={tm.deletePlanned}
                  formatMinutes={tm.formatMinutes}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Orbit Column */}
        <section className="space-y-8">
          <header className="space-y-2">
            <div className="flex items-center gap-3 opacity-40 mb-1">
              <AlertCircle size={16} strokeWidth={2.5} />
              <span className="text-xs font-bold uppercase tracking-widest">Incoming</span>
            </div>
            <h2 className="text-5xl font-semibold tracking-tight">Orbit</h2>
            <p className="text-gray-400 font-medium">Interruptions and sudden urgency.</p>
          </header>
          <div className="space-y-6">
            <form onSubmit={tm.addOrbitTask} className="relative">
              <input
                ref={tm.inputRef}
                value={tm.inputValue}
                onChange={(e) => tm.setInputValue(e.target.value)}
                placeholder={isTouchDevice ? "Capture distraction..." : "Capture distraction...  ⌘K"}
                aria-label="Add new orbit task"
                className="w-full bg-white border border-gray-100 rounded-3xl p-6 pl-14 text-lg focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all outline-none shadow-sm placeholder:text-gray-300"
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                <Plus size={24} />
              </div>
            </form>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {tm.orbit.map((task) => (
                  <OrbitCard
                    key={task.id}
                    task={task}
                    editingId={tm.editingId}
                    editValue={tm.editValue}
                    setEditValue={tm.setEditValue}
                    saveDuration={tm.saveDuration}
                    startEditing={tm.startEditing}
                    editingTextId={tm.editingTextId}
                    editTextValue={tm.editTextValue}
                    setEditTextValue={tm.setEditTextValue}
                    startEditingText={tm.startEditingText}
                    saveText={tm.saveText}
                    attemptTriage={tm.attemptTriage}
                    deleteOrbit={tm.deleteOrbit}
                    formatMinutes={tm.formatMinutes}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>
      </div>

      {/* Help button — persistent corner hint (desktop only) */}
      {!isTouchDevice && (
        <button
          onClick={() => tm.setIsHelpOpen(true)}
          aria-label="Show keyboard shortcuts (Cmd+/)"
          className="fixed bottom-6 right-6 p-3 rounded-full bg-white border border-gray-100 shadow-sm text-gray-300 opacity-40 hover:opacity-100 hover:shadow-md hover:text-gray-500 transition-all z-30"
        >
          <HelpCircle size={18} />
        </button>
      )}

      {/* Shortcut Overlay */}
      <AnimatePresence>
        {tm.isHelpOpen && (
          <ShortcutOverlay onClose={() => tm.setIsHelpOpen(false)} />
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {tm.isClosingDay && (
          <SunsetModal
            sunsetQueue={tm.sunsetQueue}
            processSunsetTask={tm.processSunsetTask}
            onClose={() => tm.setIsClosingDay(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tm.isSettingsOpen && (
          <SettingsModal
            dailyCapacity={tm.dailyCapacity}
            setDailyCapacity={tm.setDailyCapacity}
            sunsetTime={tm.sunsetTime}
            setSunsetTime={tm.setSunsetTime}
            onClose={() => tm.setIsSettingsOpen(false)}
          />
        )}
        {tm.triageTask && (
          <TriageModal
            triageTask={tm.triageTask}
            planned={tm.planned}
            executeTradeOff={tm.executeTradeOff}
            onClose={() => tm.setTriageTask(null)}
            formatMinutes={tm.formatMinutes}
            totalPlannedMinutes={tm.totalPlannedMinutes}
            dailyCapacity={tm.dailyCapacity}
          />
        )}
      </AnimatePresence>

      {/* Undo Toast */}
      <AnimatePresence>
        {tm.recentlyRemoved && (
          <UndoToast
            task={tm.recentlyRemoved.task}
            onUndo={tm.undoRemoval}
            onDismiss={tm.dismissUndo}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
