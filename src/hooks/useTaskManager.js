import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  DEFAULT_CAPACITY,
  DEFAULT_DURATION,
  DEFAULT_SUNSET_TIME,
  CHECK_INTERVAL_MS,
} from '../constants';

const UNDO_TIMEOUT_MS = 8000;

function safeParse(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    console.error(`Failed to parse localStorage key "${key}", using fallback`);
    return fallback;
  }
}

function safeLocalSet(key, value) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write localStorage key "${key}":`, e);
  }
}

// Convert DB task to app task format
function dbToApp(dbTask) {
  return {
    id: dbTask.id,
    text: dbTask.text,
    duration: dbTask.duration_minutes,
    priority: dbTask.priority,
    _zone: dbTask.zone,
    _position: dbTask.position,
  };
}

export default function useTaskManager(userId = null) {
  // --- State ---
  const [planned, setPlanned] = useState(() => safeParse('planned-tasks', []));
  const [orbit, setOrbit] = useState(() => safeParse('orbit-tasks', []));
  const [dailyCapacity, setDailyCapacity] = useState(() => {
    try {
      const saved = localStorage.getItem('daily-capacity');
      return saved ? Math.max(1, parseInt(saved, 10)) : DEFAULT_CAPACITY;
    } catch {
      return DEFAULT_CAPACITY;
    }
  });
  const [sunsetTime, setSunsetTime] = useState(() => {
    return localStorage.getItem('sunset-time') || DEFAULT_SUNSET_TIME;
  });

  const [inputValue, setInputValue] = useState('');
  const [intentInputValue, setIntentInputValue] = useState('');
  const [triageTask, setTriageTask] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editingTextId, setEditingTextId] = useState(null);
  const [editTextValue, setEditTextValue] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClosingDay, setIsClosingDay] = useState(false);
  const [sunsetQueue, setSunsetQueue] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentlyRemoved, setRecentlyRemoved] = useState(null);
  const [recentlyCompleted, setRecentlyCompleted] = useState(null);
  const [completedToday, setCompletedToday] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => safeParse('has-seen-onboarding', false));
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const inputRef = useRef(null);
  const intentInputRef = useRef(null);
  const undoTimerRef = useRef(null);
  const completionTimerRef = useRef(null);

  // --- Fetch from Supabase on mount (when logged in) ---
  useEffect(() => {
    if (!userId || !supabase) return;

    const fetchData = async () => {
      setIsSyncing(true);
      try {
        // Fetch tasks
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .order('position');

        if (!tasksError && tasks) {
          const intentTasks = tasks.filter(t => t.zone === 'intent').map(dbToApp);
          const orbitTasks = tasks.filter(t => t.zone === 'orbit').map(dbToApp);
          setPlanned(intentTasks);
          setOrbit(orbitTasks);
          safeLocalSet('planned-tasks', JSON.stringify(intentTasks));
          safeLocalSet('orbit-tasks', JSON.stringify(orbitTasks));
        }

        // Fetch profile settings
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!profileError && profile) {
          setDailyCapacity(profile.daily_capacity_minutes);
          setSunsetTime(profile.sunset_time);
          safeLocalSet('daily-capacity', profile.daily_capacity_minutes.toString());
          safeLocalSet('sunset-time', profile.sunset_time);
        }
      } catch (e) {
        console.error('Failed to fetch from Supabase:', e);
      }
      setIsSyncing(false);
    };

    fetchData();
  }, [userId]);

  // --- Persist to localStorage (always, as cache/offline fallback) ---
  useEffect(() => {
    safeLocalSet('planned-tasks', JSON.stringify(planned));
    safeLocalSet('orbit-tasks', JSON.stringify(orbit));
    safeLocalSet('daily-capacity', dailyCapacity.toString());
    safeLocalSet('sunset-time', sunsetTime);
    safeLocalSet('has-seen-onboarding', JSON.stringify(hasSeenOnboarding));
  }, [planned, orbit, dailyCapacity, sunsetTime, hasSeenOnboarding]);

  // --- Supabase sync helpers ---
  const syncTaskToDb = useCallback(async (task, zone, position) => {
    if (!userId || !supabase) return;
    try {
      await supabase.from('tasks').upsert({
        id: task.id,
        user_id: userId,
        text: task.text,
        duration_minutes: task.duration,
        priority: task.priority,
        zone,
        position,
      });
    } catch (e) {
      console.error('Failed to sync task:', e);
    }
  }, [userId]);

  const deleteTaskFromDb = useCallback(async (taskId) => {
    if (!userId || !supabase) return;
    try {
      await supabase.from('tasks').delete().eq('id', taskId);
    } catch (e) {
      console.error('Failed to delete task from DB:', e);
    }
  }, [userId]);

  const syncProfileToDb = useCallback(async (updates) => {
    if (!userId || !supabase) return;
    try {
      await supabase.from('profiles').update(updates).eq('id', userId);
    } catch (e) {
      console.error('Failed to sync profile:', e);
    }
  }, [userId]);

  const syncAllPositions = useCallback(async (tasks, zone) => {
    if (!userId || !supabase) return;
    try {
      const updates = tasks.map((task, i) => ({
        id: task.id,
        user_id: userId,
        text: task.text,
        duration_minutes: task.duration,
        priority: task.priority,
        zone,
        position: i,
      }));
      await supabase.from('tasks').upsert(updates);
    } catch (e) {
      console.error('Failed to sync positions:', e);
    }
  }, [userId]);

  // --- Timer cleanup ---
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, []);

  // --- Sunset timer ---
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (currentTime === sunsetTime && !isClosingDay) {
        startSunset();
      }
    };
    const timer = setInterval(checkTime, CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [sunsetTime, isClosingDay]);

  // --- Keyboard navigation ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setTriageTask(null);
        setIsClosingDay(false);
        setSunsetQueue([]);
        setIsHelpOpen(false);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        intentInputRef.current?.focus();
        return;
      }
      const isModalOpen = isSettingsOpen || triageTask || isClosingDay;
      if (!editingId && !isModalOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, planned.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
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

  // --- Helpers ---
  const formatMinutes = (mins) => {
    if (!mins || mins === 0) return '0m';
    if (mins >= 60 && mins % 60 === 0) return `${mins / 60}h`;
    if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const totalPlannedMinutes = planned.reduce((acc, task) => acc + (parseInt(task.duration, 10) || 0), 0);
  const isOverCapacity = totalPlannedMinutes > dailyCapacity;
  const capacityPercentage = Math.min((totalPlannedMinutes / dailyCapacity) * 100, 100);

  // --- Soft-delete with undo ---
  const scheduleUndoClear = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      setRecentlyRemoved(null);
      undoTimerRef.current = null;
    }, UNDO_TIMEOUT_MS);
  }, []);

  const softRemove = useCallback((task, source) => {
    setRecentlyRemoved({ task, source, timestamp: Date.now() });
    scheduleUndoClear();
  }, [scheduleUndoClear]);

  const undoRemoval = useCallback(() => {
    if (!recentlyRemoved) return;
    const { task, source } = recentlyRemoved;
    if (source === 'planned') {
      setPlanned((prev) => [task, ...prev]);
      syncTaskToDb(task, 'intent', 0);
    } else if (source === 'orbit') {
      setOrbit((prev) => [task, ...prev]);
      syncTaskToDb(task, 'orbit', 0);
    }
    setRecentlyRemoved(null);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }, [recentlyRemoved, syncTaskToDb]);

  const dismissUndo = useCallback(() => {
    setRecentlyRemoved(null);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }, []);

  // --- Completion undo ---
  const scheduleCompletionClear = useCallback(() => {
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    completionTimerRef.current = setTimeout(() => {
      setRecentlyCompleted(null);
      completionTimerRef.current = null;
    }, UNDO_TIMEOUT_MS);
  }, []);

  const undoCompletion = useCallback(() => {
    if (!recentlyCompleted) return;
    setPlanned((prev) => [recentlyCompleted, ...prev]);
    syncTaskToDb(recentlyCompleted, 'intent', 0);
    setCompletedToday((prev) => Math.max(0, prev - 1));
    setRecentlyCompleted(null);
    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }
  }, [recentlyCompleted, syncTaskToDb]);

  const dismissCompletion = useCallback(() => {
    setRecentlyCompleted(null);
    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }
  }, []);

  // --- Actions ---
  const moveTask = (index, direction) => {
    const newPlanned = [...planned];
    const element = newPlanned.splice(index, 1)[0];
    newPlanned.splice(index + direction, 0, element);
    setPlanned(newPlanned);
    setSelectedIndex(index + direction);
    syncAllPositions(newPlanned, 'intent');
  };

  const addOrbitTask = (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    const newTask = { id, text: inputValue, duration: DEFAULT_DURATION, priority: 'medium' };
    setOrbit([newTask, ...orbit]);
    setInputValue('');
    if (!hasSeenOnboarding) setHasSeenOnboarding(true);
    syncTaskToDb(newTask, 'orbit', 0);
  };

  const addIntentTask = (e) => {
    e?.preventDefault();
    if (!intentInputValue.trim()) return;
    const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    const newTask = { id, text: intentInputValue, duration: DEFAULT_DURATION, priority: 'medium' };
    setPlanned((prev) => [...prev, newTask]);
    setIntentInputValue('');
    if (!hasSeenOnboarding) setHasSeenOnboarding(true);
    syncTaskToDb(newTask, 'intent', planned.length);
  };

  const completeTask = (id) => {
    const task = planned.find((t) => t.id === id);
    if (task) {
      setRecentlyCompleted(task);
      scheduleCompletionClear();
      setCompletedToday((prev) => prev + 1);
    }
    setPlanned(planned.filter((t) => t.id !== id));
    setSelectedIndex((prev) => Math.max(prev - 1, -1));
    deleteTaskFromDb(id);
  };

  const deletePlanned = (id) => {
    const task = planned.find((t) => t.id === id);
    if (task) softRemove(task, 'planned');
    setPlanned(planned.filter((t) => t.id !== id));
    deleteTaskFromDb(id);
  };

  const deleteOrbit = (id) => {
    const task = orbit.find((t) => t.id === id);
    if (task) softRemove(task, 'orbit');
    setOrbit(orbit.filter((t) => t.id !== id));
    deleteTaskFromDb(id);
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditValue(task.duration.toString());
  };

  const startEditingText = (task) => {
    setEditingTextId(task.id);
    setEditTextValue(task.text);
  };

  const saveText = () => {
    const trimmed = editTextValue.trim();
    if (!trimmed) {
      setEditingTextId(null);
      return;
    }
    const updateTask = (list) => list.map((t) => (t.id === editingTextId ? { ...t, text: trimmed } : t));
    const updatedPlanned = updateTask(planned);
    const updatedOrbit = updateTask(orbit);
    setPlanned(updatedPlanned);
    setOrbit(updatedOrbit);
    setEditingTextId(null);

    // Sync the edited task
    const task = [...updatedPlanned, ...updatedOrbit].find(t => t.id === editingTextId);
    if (task) {
      const zone = updatedPlanned.find(t => t.id === editingTextId) ? 'intent' : 'orbit';
      syncTaskToDb(task, zone, 0);
    }
  };

  const saveDuration = () => {
    const val = Math.max(0, parseInt(editValue, 10) || 0);
    const updateTask = (list) => list.map((t) => (t.id === editingId ? { ...t, duration: val } : t));
    const updatedPlanned = updateTask(planned);
    const updatedOrbit = updateTask(orbit);
    setPlanned(updatedPlanned);
    setOrbit(updatedOrbit);
    setEditingId(null);

    const task = [...updatedPlanned, ...updatedOrbit].find(t => t.id === editingId);
    if (task) {
      const zone = updatedPlanned.find(t => t.id === editingId) ? 'intent' : 'orbit';
      syncTaskToDb(task, zone, 0);
    }
  };

  const togglePriority = (id) => {
    const toggle = (list) => list.map((t) =>
      t.id === id ? { ...t, priority: t.priority === 'high' ? 'medium' : 'high' } : t
    );
    const updatedPlanned = toggle(planned);
    const updatedOrbit = toggle(orbit);
    setPlanned(updatedPlanned);
    setOrbit(updatedOrbit);

    const task = [...updatedPlanned, ...updatedOrbit].find(t => t.id === id);
    if (task) {
      const zone = updatedPlanned.find(t => t.id === id) ? 'intent' : 'orbit';
      syncTaskToDb(task, zone, 0);
    }
  };

  const attemptTriage = (task) => {
    if (!task) return;
    const wouldExceed = totalPlannedMinutes + (parseInt(task.duration, 10) || 0) > dailyCapacity;
    if (!wouldExceed) {
      setPlanned((prev) => [{ ...task }, ...prev]);
      setOrbit((prev) => prev.filter((t) => t.id !== task.id));
      syncTaskToDb(task, 'intent', 0);
    } else {
      setTriageTask(task);
    }
  };

  const executeTradeOff = (bumpedTaskId) => {
    const taskToInsert = triageTask;
    const bumpedTask = planned.find((t) => t.id === bumpedTaskId);
    const filteredPlanned = planned.filter((t) => t.id !== bumpedTaskId);
    setPlanned([{ ...taskToInsert }, ...filteredPlanned]);
    setOrbit([{ ...bumpedTask, priority: 'low' }, ...orbit.filter((t) => t.id !== taskToInsert.id)]);
    setTriageTask(null);
    syncTaskToDb(taskToInsert, 'intent', 0);
    syncTaskToDb({ ...bumpedTask, priority: 'low' }, 'orbit', 0);
  };

  const startSunset = () => {
    setSunsetQueue([...planned]);
    setIsClosingDay(true);
  };

  const processSunsetTask = (task, decision) => {
    if (!task || sunsetQueue.length === 0) return;
    if (task.id !== sunsetQueue[0].id) return;

    if (decision === 'orbit') {
      setOrbit((prev) => [{ ...task, priority: 'low' }, ...prev]);
      setPlanned((prev) => prev.filter((t) => t.id !== task.id));
      syncTaskToDb({ ...task, priority: 'low' }, 'orbit', 0);
    } else if (decision === 'discard') {
      softRemove(task, 'planned');
      setPlanned((prev) => prev.filter((t) => t.id !== task.id));
      deleteTaskFromDb(task.id);
    }
    setSunsetQueue((prev) => prev.filter((t) => t.id !== task.id));
  };

  // --- Settings sync ---
  const updateDailyCapacity = (value) => {
    const clamped = Math.max(1, value);
    setDailyCapacity(clamped);
    syncProfileToDb({ daily_capacity_minutes: clamped });
  };

  const updateSunsetTime = (value) => {
    setSunsetTime(value);
    syncProfileToDb({ sunset_time: value });
  };

  return {
    planned,
    setPlanned: (newPlanned) => {
      setPlanned(newPlanned);
      syncAllPositions(newPlanned, 'intent');
    },
    orbit,
    dailyCapacity,
    setDailyCapacity: updateDailyCapacity,
    sunsetTime,
    setSunsetTime: updateSunsetTime,
    inputValue,
    setInputValue,
    intentInputValue,
    setIntentInputValue,
    triageTask,
    setTriageTask,
    editingId,
    editValue,
    setEditValue,
    editingTextId,
    editTextValue,
    setEditTextValue,
    startEditingText,
    saveText,
    isSettingsOpen,
    setIsSettingsOpen,
    isClosingDay,
    setIsClosingDay,
    sunsetQueue,
    selectedIndex,
    recentlyRemoved,
    recentlyCompleted,
    completedToday,
    hasSeenOnboarding,
    setHasSeenOnboarding,
    isHelpOpen,
    setIsHelpOpen,
    isSyncing,
    inputRef,
    intentInputRef,
    totalPlannedMinutes,
    isOverCapacity,
    capacityPercentage,
    formatMinutes,
    addOrbitTask,
    addIntentTask,
    moveTask,
    completeTask,
    deletePlanned,
    deleteOrbit,
    startEditing,
    saveDuration,
    togglePriority,
    attemptTriage,
    executeTradeOff,
    startSunset,
    processSunsetTask,
    undoRemoval,
    dismissUndo,
    undoCompletion,
    dismissCompletion,
  };
}
