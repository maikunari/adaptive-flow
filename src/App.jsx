import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight, AlertCircle, CheckCircle2, X, Trash2, Calendar, Settings2, Moon } from 'lucide-react';

const App = () => {
  // --- State ---
  const [planned, setPlanned] = useState(() => {
    const saved = localStorage.getItem('planned-tasks');
    return saved ? JSON.parse(saved) : []; // Start empty to test the fix
  });

  const [orbit, setOrbit] = useState(() => {
    const saved = localStorage.getItem('orbit-tasks');
    return saved ? JSON.parse(saved) : [
      { id: '4', text: 'URGENT: Fix landing page bug', duration: 60, priority: 'high' },
    ];
  });

  const [dailyCapacity, setDailyCapacity] = useState(() => {
    const saved = localStorage.getItem('daily-capacity');
    return saved ? parseInt(saved) : 480; 
  });

  const [sunsetTime, setSunsetTime] = useState(() => {
    const saved = localStorage.getItem('sunset-time');
    return saved ? saved : "18:00";
  });

  const [inputValue, setInputValue] = useState('');
  const [triageTask, setTriageTask] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClosingDay, setIsClosingDay] = useState(false);
  const [sunsetQueue, setSunsetQueue] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef(null);
  const intentZoneRef = useRef(null);
  const orbitZoneRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('planned-tasks', JSON.stringify(planned));
    localStorage.setItem('orbit-tasks', JSON.stringify(orbit));
    localStorage.setItem('daily-capacity', dailyCapacity.toString());
    localStorage.setItem('sunset-time', sunsetTime);
  }, [planned, orbit, dailyCapacity, sunsetTime]);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (currentTime === sunsetTime && !isClosingDay) {
        startSunset();
      }
    };
    const timer = setInterval(checkTime, 60000);
    return () => clearInterval(timer);
  }, [sunsetTime, isClosingDay]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setTriageTask(null);
        setIsClosingDay(false);
        setSunsetQueue([]);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }
      const isModalOpen = isSettingsOpen || triageTask || isClosingDay;
      if (!editingId && !isModalOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, planned.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault();
          completeTask(planned[selectedIndex].id);
        } else if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowUp' && selectedIndex > 0) {
          e.preventDefault();
          moveTask(selectedIndex, -1);
        } else if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowDown' && selectedIndex < planned.length - 1) {
          e.preventDefault();
          moveTask(selectedIndex, 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, planned, editingId, isSettingsOpen, triageTask, isClosingDay]);

  const moveTask = (index, direction) => {
    const newPlanned = [...planned];
    const element = newPlanned.splice(index, 1)[0];
    newPlanned.splice(index + direction, 0, element);
    setPlanned(newPlanned);
    setSelectedIndex(index + direction);
  };

  const formatMinutes = (mins) => {
    if (!mins || mins === 0) return '0m';
    if (mins >= 60 && mins % 60 === 0) return `${mins / 60}h`;
    if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const totalPlannedMinutes = planned.reduce((acc, task) => acc + (parseInt(task.duration) || 0), 0);
  const isOverCapacity = totalPlannedMinutes > dailyCapacity;
  const capacityPercentage = Math.min((totalPlannedMinutes / dailyCapacity) * 100, 100);

  const addOrbitTask = (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    const newTask = { id: Date.now().toString(), text: inputValue, duration: 30, priority: 'medium' };
    setOrbit([newTask, ...orbit]);
    setInputValue('');
  };

  const completeTask = (id) => {
    setPlanned(planned.filter(t => t.id !== id));
    setSelectedIndex(prev => Math.max(prev - 1, -1));
  };

  const deletePlanned = (id) => setPlanned(planned.filter(t => t.id !== id));
  const deleteOrbit = (id) => setOrbit(orbit.filter(t => t.id !== id));

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditValue(task.duration.toString());
  };

  const saveDuration = () => {
    const val = parseInt(editValue) || 0;
    const updateTask = (list) => list.map(t => t.id === editingId ? { ...t, duration: val } : t);
    setPlanned(updateTask(planned));
    setOrbit(updateTask(orbit));
    setEditingId(null);
  };

  // --- THE FIX: SMART TRIAGE LOGIC ---
  const attemptTriage = (task) => {
    if (planned.length === 0) {
      // Blank Slate: Just add it immediately
      setPlanned([{ ...task }]);
      setOrbit(prev => prev.filter(t => t.id !== task.id));
    } else {
      // Trade-off required: Open the modal
      setTriageTask(task);
    }
  };

  const executeTradeOff = (bumpedTaskId) => {
    const taskToInsert = triageTask;
    const bumpedTask = planned.find(t => t.id === bumpedTaskId);
    const filteredPlanned = planned.filter(t => t.id !== bumpedTaskId);
    setPlanned([{ ...taskToInsert }, ...filteredPlanned]);
    setOrbit([{ ...bumpedTask, priority: 'low' }, ...orbit.filter(t => t.id !== taskToInsert.id)]);
    setTriageTask(null);
  };

  const handleDragEnd = (event, info, task, source) => {
    const { x, y } = info.point;
    if (orbitZoneRef.current) {
      const rect = orbitZoneRef.current.getBoundingClientRect();
      if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
        if (source === 'planned') {
          setOrbit(prev => [{ ...task, priority: 'low' }, ...prev]);
          setPlanned(prev => prev.filter(t => t.id !== task.id));
        }
        return;
      }
    }
    if (intentZoneRef.current) {
      const rect = intentZoneRef.current.getBoundingClientRect();
      if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
        if (source === 'orbit') {
          attemptTriage(task); // Use the smart triage logic here
        }
        return;
      }
    }
  };

  const startSunset = () => {
    setSunsetQueue([...planned]);
    setIsClosingDay(true);
  };

  const processSunsetTask = (task, decision) => {
    if (decision === 'orbit') {
      setOrbit(prev => [{ ...task, priority: 'low' }, ...prev]);
      setPlanned(prev => prev.filter(t => t.id !== task.id));
    } else if (decision === 'discard') {
      setPlanned(prev => prev.filter(t => t.id !== task.id));
    }
    setSunsetQueue(prev => prev.filter(t => t.id !== task.id));
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${isClosingDay ? 'bg-[#FDF6E3]' : 'bg-[#FBFBFD]'} text-[#1D1D1F] font-sans selection:bg-blue-100 p-6 md:p-12 flex justify-center`}>
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
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
                <button onClick={startSunset} className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all text-gray-500 hover:text-amber-600">
                  <Moon size={14} />
                  <span className="text-xs font-bold uppercase tracking-tighter">Close Day</span>
                </button>
                <button onClick={() => setIsSettingsOpen(true)} className={`group flex items-center gap-3 px-4 py-2 rounded-full shadow-sm transition-all border ${isOverCapacity ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-600'}`}>
                  <motion.div animate={isOverCapacity ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: Infinity, duration: 2 }} className="relative w-8 h-8 rounded-full bg-gray-100 overflow-hidden border border-white">
                    <motion.div className={`absolute bottom-0 left-0 right-0 transition-colors ${isOverCapacity ? 'bg-red-500' : capacityPercentage > 70 ? 'bg-orange-400' : 'bg-blue-500'}`} initial={{ height: 0 }} animate={{ height: `${capacityPercentage}%` }} />
                  </motion.div>
                  <div className="text-left">
                    <p className={`text-[10px] font-bold uppercase tracking-tighter leading-none ${isOverCapacity ? 'text-red-400' : 'text-gray-400'}`}>{isOverCapacity ? 'Over Capacity' : 'Capacity'}</p>
                    <p className="text-xs font-semibold leading-tight">{totalPlannedMinutes} / {dailyCapacity}m</p>
                  </div>
                  <Settings2 size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>
              </div>
            </div>
            <p className="text-gray-400 font-medium">The non-negotiable commitments.</p>
          </header>
          <div ref={intentZoneRef} className="space-y-3">
            <AnimatePresence mode="popLayout">
              {planned.map((task, index) => (
                <motion.div layout drag dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} dragElastic={0.7} dragMomentum={false} onDragEnd={(e, info) => handleDragEnd(e, info, task, 'planned')} whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: "0 20px 40px rgba(0,0,0,0.1)", cursor: 'grabbing' }} transition={{ type: "spring", stiffness: 400, damping: 30 }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={task.id} className={`group bg-white border p-5 rounded-[28px] shadow-sm transition-all flex items-center justify-between cursor-grab ${selectedIndex === index ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' : 'border-gray-100 hover:shadow-md'}`}>
                  <div className="flex items-center gap-4">
                    <button onClick={() => completeTask(task.id)} className="text-gray-300 hover:text-blue-500 transition-colors"><CheckCircle2 size={24} /></button>
                    <span className="text-lg font-medium">{task.text}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {editingId === task.id ? (
                      <input type="number" autoFocus className="w-16 text-right text-xs font-semibold text-blue-600 outline-none bg-blue-50 rounded px-2 py-1" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveDuration} onKeyDown={(e) => e.key === 'Enter' && saveDuration()} />
                    ) : (
                      <button onClick={() => startEditing(task)} className="text-xs font-semibold text-gray-300 uppercase tracking-tighter hover:text-gray-500 transition-colors cursor-text">{formatMinutes(task.duration)}</button>
                    )}
                    <button onClick={() => deletePlanned(task.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {planned.length === 0 && <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[40px] text-gray-300 font-medium">Your day is clear. Ready for intent.</div>}
          </div>
        </section>
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
            <form onSubmit={addOrbitTask} className="relative">
              <input ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Capture distraction... (Cmd+K)" className="w-full bg-white border border-gray-100 rounded-3xl p-6 pl-14 text-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none shadow-sm placeholder:text-gray-300" />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"><Plus size={24} /></div>
            </form>
            <div ref={orbitZoneRef} className="space-y-3">
              <AnimatePresence mode="popLayout">
                {orbit.map((task) => (
                  <motion.div layout drag dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} dragElastic={0.7} dragMomentum={false} onDragEnd={(e, info) => handleDragEnd(e, info, task, 'orbit')} whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: "0 20px 40px rgba(0,0,0,0.1)", cursor: 'grabbing' }} transition={{ type: "spring", stiffness: 400, damping: 30 }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key={task.id} className="bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all cursor-grab">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-orange-400' : 'bg-gray-300'}`} />
                      <span className="text-lg font-medium">{task.text}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {editingId === task.id ? (
                        <input type="number" autoFocus className="w-16 text-right text-xs font-semibold text-blue-600 outline-none bg-blue-50 rounded px-2 py-1" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveDuration} onKeyDown={(e) => e.key === 'Enter' && saveDuration()} />
                      ) : (
                        <button onClick={() => startEditing(task)} className="text-xs font-semibold text-gray-300 uppercase tracking-tighter hover:text-gray-500 transition-colors cursor-text">{formatMinutes(task.duration)}</button>
                      )}
                      <button onClick={() => attemptTriage(task)} className="p-3 bg-gray-50 rounded-full text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all"><ArrowRight size={20} /></button>
                      <button onClick={() => deleteOrbit(task.id)} className="p-3 text-gray-300 hover:text-red-400 transition-all"><X size={20} /></button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>

      {/* MODALS (Sunset, Settings, Triage remain same) */}
      <AnimatePresence>
        {isClosingDay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-amber-900/20 backdrop-blur-3xl flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-lg rounded-[48px] p-12 shadow-2xl text-center border border-amber-100 relative">
              <button onClick={() => setIsClosingDay(false)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-600 transition-colors"><X size={20} /></button>
              {sunsetQueue.length > 0 ? (
                <>
                  <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6"><Moon size={32} /></div>
                  <h3 className="text-3xl font-semibold mb-3 tracking-tight">Sunset Review</h3>
                  <p className="text-gray-400 mb-10 text-lg font-medium">You didn't finish <span className="text-black font-semibold">"{sunsetQueue[0].text}"</span>. What happens to it?</p>
                  <div className="grid gap-3">
                    <button onClick={() => processSunsetTask(sunsetQueue[0], 'carry')} className="w-full p-5 rounded-3xl bg-black text-white font-semibold hover:bg-gray-800 transition-all">Keep for Tomorrow</button>
                    <button onClick={() => processSunsetTask(sunsetQueue[0], 'orbit')} className="w-full p-5 rounded-3xl border border-gray-100 hover:border-amber-400 hover:bg-amber-50 transition-all font-medium">Return to Orbit</button>
                    <button onClick={() => processSunsetTask(sunsetQueue[0], 'discard')} className="w-full p-5 rounded-3xl text-gray-400 hover:text-red-500 transition-all font-medium">Discard</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={32} /></div>
                  <h3 className="text-3xl font-semibold mb-3 tracking-tight">Day Closed</h3>
                  <p className="text-gray-400 mb-10 text-lg font-medium">Your mind is clear. Rest now.</p>
                  <button onClick={() => setIsClosingDay(false)} className="w-full p-5 rounded-3xl bg-black text-white font-semibold hover:bg-gray-800 transition-all">Rest Now</button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-white/60 backdrop-blur-2xl flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-[48px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 text-center relative">
              <button onClick={() => setIsSettingsOpen(false)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-600 transition-colors"><X size={20} /></button>
              <div className="w-16 h-16 bg-gray-50 text-gray-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><Settings2 size={32} /></div>
              <h3 className="text-3xl font-semibold mb-8 tracking-tight">Personalize</h3>
              <div className="space-y-8 mb-10">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block">Daily Capacity (mins)</label>
                  <input type="number" value={dailyCapacity} onChange={(e) => setDailyCapacity(parseInt(e.target.value) || 0)} className="text-center text-3xl font-semibold w-full outline-none border-b border-gray-100 pb-2 text-blue-600" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block">Sunset Ritual Time</label>
                  <input type="time" value={sunsetTime} onChange={(e) => setSunsetTime(e.target.value)} className="text-center text-3xl font-semibold w-full outline-none border-b border-gray-100 pb-2 text-amber-600" />
                </div>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="w-full p-5 rounded-3xl bg-black text-white font-semibold hover:bg-gray-800 transition-all">Save Preferences</button>
            </motion.div>
          </motion.div>
        )}
        {triageTask && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-white/60 backdrop-blur-2xl flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-lg rounded-[48px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 text-center relative">
              <button onClick={() => setTriageTask(null)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-600 transition-colors"><X size={20} /></button>
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><ArrowRight size={32} /></div>
              <h3 className="text-3xl font-semibold mb-3 tracking-tight">Re-calibrate</h3>
              <p className="text-gray-400 mb-10 text-lg font-medium">To make room for <span className="text-black font-semibold">"{triageTask.text}"</span>, what will you move back to the orbit?</p>
              <div className="grid gap-3 mb-10">
                {planned.map((task) => (
                  <button key={task.id} onClick={() => executeTradeOff(task.id)} className="w-full p-5 rounded-3xl border border-gray-100 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left font-medium flex justify-between items-center group">
                    <span className="text-lg">{task.text}</span>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                  </button>
                ))}
              </div>
              <button onClick={() => setTriageTask(null)} className="text-gray-400 hover:text-gray-600 transition-colors font-semibold text-sm uppercase tracking-widest">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;