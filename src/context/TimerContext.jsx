import React, { createContext, useState, useEffect, useContext } from 'react';
import { addSession } from '../lib/storage';
import { playChimeSound } from '../lib/audio';

const TimerContext = createContext();

export const useTimer = () => useContext(TimerContext);

export const TimerProvider = ({ children }) => {
  const [mode, setMode] = useState('stopwatch'); // 'stopwatch' | 'timer' | 'manual'
  const [seconds, setSeconds] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeTrackId, setActiveTrackId] = useState(null);
  const [activeGoal, setActiveGoal] = useState(null); // { id, title }
  const [showCelebration, setShowCelebration] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (mode === 'stopwatch') {
          setSeconds(s => s + 1);
        } else if (mode === 'timer') {
          setTimerSeconds(s => {
            if (s <= 1) {
              clearInterval(interval);
              setIsTimerRunning(false);
              handleFinish(true);
              return 0;
            }
            return s - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, mode]);

  const openTimerModal = (trackId, goal = null) => {
    setActiveTrackId(trackId);
    setActiveGoal(goal);
    setIsModalOpen(true);
    if (!isTimerRunning) {
      setMode('stopwatch');
      setSeconds(0);
      setTimerSeconds(25 * 60);
    }
  };

  const closeTimerModal = () => {
    setIsModalOpen(false);
  };

  const handleFinish = (autoComplete = false, manualMins = 0) => {
    setIsTimerRunning(false);
    
    let duration = 0;
    if (mode === 'stopwatch') {
      duration = Math.round(seconds / 60);
      if (duration === 0 && seconds > 10) duration = 1;
    } else if (mode === 'timer') {
      const elapsedMins = Math.round((25 * 60 - timerSeconds) / 60);
      duration = elapsedMins > 0 ? elapsedMins : (autoComplete ? 25 : 0);
    } else {
      duration = manualMins;
    }

    if (duration > 0 && activeTrackId) {
      addSession({
        trackId: activeTrackId,
        goalId: activeGoal?.id || null,
        durationMinutes: duration,
      });
      
      // Reset values
      setSeconds(0);
      setTimerSeconds(25 * 60);
      setActiveTrackId(null);
      setActiveGoal(null);

      setShowCelebration(true);
      playChimeSound();
      setTimeout(() => {
        setShowCelebration(false);
      }, 2500);
    } else {
      // Just clear
      setSeconds(0);
      setTimerSeconds(25 * 60);
      setActiveTrackId(null);
      setActiveGoal(null);
    }
    setIsModalOpen(false);
  };

  return (
    <TimerContext.Provider value={{
      mode, setMode,
      seconds, setSeconds,
      timerSeconds, setTimerSeconds,
      isTimerRunning, setIsTimerRunning,
      activeTrackId, activeGoal,
      isModalOpen, openTimerModal, closeTimerModal,
      showCelebration, handleFinish
    }}>
      {children}
    </TimerContext.Provider>
  );
};
