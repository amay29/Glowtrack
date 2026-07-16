import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Maximize2 } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

const FloatingTimer = () => {
  const {
    isTimerRunning,
    mode,
    seconds,
    timerSeconds,
    setIsTimerRunning,
    openTimerModal,
    activeTrackId,
    activeGoal,
    isModalOpen
  } = useTimer();

  if (isModalOpen || (!isTimerRunning && seconds === 0 && timerSeconds === 25 * 60)) {
    return null;
  }

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleOpenModal = () => {
    openTimerModal(activeTrackId, activeGoal);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        style={{
          position: 'fixed',
          bottom: '80px', // above bottom nav
          right: '1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '2rem',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
          zIndex: 90
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
            {mode === 'stopwatch' ? formatTime(seconds) : formatTime(timerSeconds)}
          </span>
          {activeGoal && (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeGoal.title}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            onClick={() => setIsTimerRunning(!isTimerRunning)} 
            style={{ 
              backgroundColor: isTimerRunning ? 'var(--warning-color)' : 'var(--success-color)', 
              color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
            }}
          >
            {isTimerRunning ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: '2px' }}/>}
          </button>
          
          <button 
            onClick={handleOpenModal}
            style={{ color: 'var(--text-muted)', backgroundColor: 'transparent', border: 'none', padding: '0.25rem', cursor: 'pointer' }}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingTimer;
