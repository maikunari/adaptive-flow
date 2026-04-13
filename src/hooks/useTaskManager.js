import { useState, useEffect, useRef } from 'react';
import {
  DEFAULT_CAPACITY,
  DEFAULT_DURATION,
  DEFAULT_SUNSET_TIME,
  CHECK_INTERVAL_MS,
} from '../constants';

function safeParse(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    console.error(`Failed to parse localStorage key "${key}", using fallback`);
    return fallback;
  }
}

export default function useTaskManager() {
  // --- State ---
  const [planned, setPlanned] = useState(() => safeParse('planned-tasks', []));
  const [orbit, setOrbit] = useState(() => safeParse('orbit-tasks', []));
  const [dailyCapacity, setDailyCapacity] = useState(() => {
    try {
      const saved = localStorage.getItem('daily-capacity');
      return saved ? parseInt(saved, 10) : DEFAULT_CAPACITY;
    } catch {
      return DEFAULT_CAPACITY;
    }
  });
  const [sunsetTime, setSunsetTime] = useState(() => {
    return localStorage.getItem('sunset-time') || DEFAULT_SUNSET_TIME;
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

  // --- Persist to localStorage ---
  useEffect(() => {
    localStorage.setItem('planned-tasks', JSON.stringify(planned));
    localStorage.setItem('orbit-tasks', JSON.stringify(orbit));
    localStorage.setItem('daily-capacity', dailyCapacity.toString());
    localStorage.setItem('sunset-time', sunsetTime);
  }, [planned, orbit, dailyCapacity, sunsetTime]);

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

  // --- Actions ---
  const moveTask = (index, direction) => {
    const newPlanned = [...planned];
    const element = newPlanned.splice(index, 1)[0];
    newPlanned.splice(index + direction, 0, element);
    setPlanned(newPlanned);
    setSelectedIndex(index + direction);
  };

  const addOrbitTask = (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    const newTask = { id: Date.now().toString(), text: inputValue, duration: DEFAULT_DURATION, priority: 'medium' };
    setOrbit([newTask, ...orbit]);
    setInputValue('');
  };

  const completeTask = (id) => {
    setPlanned(planned.filter((t) => t.id !== id));
    setSelectedIndex((prev) => Math.max(prev - 1, -1));
  };

  const deletePlanned = (id) => setPlanned(planned.filter((t) => t.id !== id));
  const deleteOrbit = (id) => setOrbit(orbit.filter((t) => t.id !== id));

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditValue(task.duration.toString());
  };

  const saveDuration = () => {
    const val = Math.max(0, parseInt(editValue, 10) || 0);
    const updateTask = (list) => list.map((t) => (t.id === editingId ? { ...t, duration: val } : t));
    setPlanned(updateTask(planned));
    setOrbit(updateTask(orbit));
    setEditingId(null);
  };

  const attemptTriage = (task) => {
    if (!task) return;
    const wouldExceed = totalPlannedMinutes + (parseInt(task.duration, 10) || 0) > dailyCapacity;
    if (!wouldExceed) {
      setPlanned((prev) => [{ ...task }, ...prev]);
      setOrbit((prev) => prev.filter((t) => t.id !== task.id));
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
  };

  const handleDragEnd = (event, info, task, source) => {
    const { x, y } = info.point;
    if (orbitZoneRef.current) {
      const rect = orbitZoneRef.current.getBoundingClientRect();
      if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
        if (source === 'planned') {
          setOrbit((prev) => [{ ...task, priority: 'low' }, ...prev]);
          setPlanned((prev) => prev.filter((t) => t.id !== task.id));
        }
        return;
      }
    }
    if (intentZoneRef.current) {
      const rect = intentZoneRef.current.getBoundingClientRect();
      if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
        if (source === 'orbit') {
          attemptTriage(task);
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
    if (!task || sunsetQueue.length === 0) return;
    if (task.id !== sunsetQueue[0].id) return;

    if (decision === 'orbit') {
      setOrbit((prev) => [{ ...task, priority: 'low' }, ...prev]);
      setPlanned((prev) => prev.filter((t) => t.id !== task.id));
    } else if (decision === 'discard') {
      setPlanned((prev) => prev.filter((t) => t.id !== task.id));
    }
    // 'carry' — task stays in planned, just remove from queue
    setSunsetQueue((prev) => prev.filter((t) => t.id !== task.id));
  };

  return {
    // State
    planned,
    orbit,
    dailyCapacity,
    setDailyCapacity,
    sunsetTime,
    setSunsetTime,
    inputValue,
    setInputValue,
    triageTask,
    setTriageTask,
    editingId,
    editValue,
    setEditValue,
    isSettingsOpen,
    setIsSettingsOpen,
    isClosingDay,
    setIsClosingDay,
    sunsetQueue,
    selectedIndex,
    // Refs
    inputRef,
    intentZoneRef,
    orbitZoneRef,
    // Computed
    totalPlannedMinutes,
    isOverCapacity,
    capacityPercentage,
    // Helpers
    formatMinutes,
    // Actions
    addOrbitTask,
    completeTask,
    deletePlanned,
    deleteOrbit,
    startEditing,
    saveDuration,
    attemptTriage,
    executeTradeOff,
    handleDragEnd,
    startSunset,
    processSunsetTask,
  };
}
