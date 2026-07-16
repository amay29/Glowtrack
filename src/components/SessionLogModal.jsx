import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Square, Check, Flame, Clock } from 'lucide-react';
import { addSession } from '../lib/storage';

const SessionLogModal = ({ isOpen, onClose, trackId, selectedGoal }) => {
  // mode: 'stopwatch' | 'timer' | 'manual'
  const [mode, setMode] = useState('stopwatch'); 
  const [seconds, setSeconds] = useState(0); // For stopwatch
  const [timerSeconds, setTimerSeconds] = useState(25 * 60); // Default 25 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [manualMinutes, setManualMinutes] = useState(25);
  const [showCelebration, setShowCelebration] = useState(false);

  // Timer/Stopwatch loop
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
              handleFinish(true); // auto finish
              return 0;
            }
            return s - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, mode]);

  useEffect(() => {
    if (isOpen) {
      setSeconds(0);
      setTimerSeconds(25 * 60);
      setIsTimerRunning(false);
      setShowCelebration(false);
      setMode('stopwatch');
    }
  }, [isOpen]);

  const handleFinish = (autoComplete = false) => {
    if (isTimerRunning) setIsTimerRunning(false);
    
    let duration = 0;
    if (mode === 'stopwatch') {
      duration = Math.round(seconds / 60);
      if (duration === 0 && seconds > 10) duration = 1; // Round up if at least 10s
    } else if (mode === 'timer') {
      // Calculate how much time passed vs original target. Actually, just record what they did or if completed.
      // Wait, if autoComplete, duration = initial target. But we don't store initial target easily.
      // For simplicity, let's just record the elapsed time for timer:
      // (25 * 60 - timerSeconds) / 60
      const elapsedMins = Math.round((25 * 60 - timerSeconds) / 60);
      duration = elapsedMins > 0 ? elapsedMins : (autoComplete ? 25 : 0);
    } else {
      duration = manualMinutes;
    }

    if (duration > 0 && trackId) {
      addSession({
        trackId: trackId,
        goalId: selectedGoal?.id || null,
        durationMinutes: duration,
      });
      
      setShowCelebration(true);
      setTimeout(() => {
        onClose();
        setShowCelebration(false);
      }, 2500);
    } else {
      onClose();
    }
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen && !showCelebration) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 100
            }}
            onClick={onClose}
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--bg-secondary)',
              borderTopLeftRadius: 'var(--radius-lg)',
              borderTopRightRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              paddingBottom: '3rem',
              zIndex: 101,
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {showCelebration ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ textAlign: 'center', padding: '2rem 0' }}
              >
                <motion.div 
                  animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--success-color)', color: 'white', marginBottom: '1rem' }}
                >
                  <Flame size={40} fill="currentColor" />
                </motion.div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Great Job!</h2>
                <p style={{ color: 'var(--text-secondary)' }}>You've made solid progress.</p>
              </motion.div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={20} color="var(--accent-primary)" /> Log Session
                    </h2>
                    {selectedGoal && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', fontWeight: 600 }}>
                        Target: {selectedGoal.title}
                      </p>
                    )}
                  </div>
                  <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', backgroundColor: 'var(--bg-primary)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                  <button 
                    onClick={() => setMode('stopwatch')}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, backgroundColor: mode === 'stopwatch' ? 'var(--bg-secondary)' : 'transparent', color: mode === 'stopwatch' ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: mode === 'stopwatch' ? 'var(--shadow-sm)' : 'none', transition: 'var(--transition-smooth)' }}
                  >Stopwatch</button>
                  <button 
                    onClick={() => setMode('timer')}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, backgroundColor: mode === 'timer' ? 'var(--bg-secondary)' : 'transparent', color: mode === 'timer' ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: mode === 'timer' ? 'var(--shadow-sm)' : 'none', transition: 'var(--transition-smooth)' }}
                  >Timer</button>
                  <button 
                    onClick={() => setMode('manual')}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, backgroundColor: mode === 'manual' ? 'var(--bg-secondary)' : 'transparent', color: mode === 'manual' ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: mode === 'manual' ? 'var(--shadow-sm)' : 'none', transition: 'var(--transition-smooth)' }}
                  >Manual</button>
                </div>

                {mode === 'stopwatch' || mode === 'timer' ? (
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    {mode === 'timer' && !isTimerRunning && timerSeconds === 25 * 60 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Set Mins:</span>
                        <input 
                          type="number" 
                          value={Math.round(timerSeconds / 60)} 
                          onChange={(e) => setTimerSeconds((parseInt(e.target.value) || 0) * 60)}
                          style={{ width: '60px', padding: '0.25rem', textAlign: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                        />
                      </div>
                    )}
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'monospace', letterSpacing: '-0.05em' }}>
                      {mode === 'stopwatch' ? formatTime(seconds) : formatTime(timerSeconds)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                      {!isTimerRunning ? (
                        <button onClick={() => setIsTimerRunning(true)} className="btn-primary" style={{ width: '64px', height: '64px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Play fill="currentColor" size={28} style={{ marginLeft: '4px' }} />
                        </button>
                      ) : (
                        <button onClick={() => setIsTimerRunning(false)} className="btn-primary" style={{ width: '64px', height: '64px', borderRadius: '50%', padding: 0, backgroundColor: 'var(--warning-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Square fill="currentColor" size={24} />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Duration (minutes)</label>
                    <input 
                      type="number" 
                      value={manualMinutes} 
                      onChange={(e) => setManualMinutes(parseInt(e.target.value) || 0)}
                      min="1"
                      style={{
                        width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '1.25rem', textAlign: 'center', fontWeight: 700
                      }}
                    />
                  </div>
                )}

                <button 
                  onClick={() => handleFinish(false)} 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '1rem', backgroundColor: ((mode === 'stopwatch' && seconds < 10) || (mode === 'timer' && timerSeconds === 25*60 && !isTimerRunning)) ? 'var(--bg-tertiary)' : 'var(--success-color)' }}
                >
                  <Check size={20} /> Finish & Save
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SessionLogModal;
