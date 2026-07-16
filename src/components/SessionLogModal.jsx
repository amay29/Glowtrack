import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Square, Check, Flame } from 'lucide-react';
import { addSession } from '../lib/storage';

const SessionLogModal = ({ isOpen, onClose, tracks }) => {
  const [mode, setMode] = useState('timer'); // 'timer' or 'manual'
  const [selectedTrack, setSelectedTrack] = useState('');
  const [manualMinutes, setManualMinutes] = useState(30);
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!isTimerRunning && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, seconds]);

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setShowCelebration(false);
      setSeconds(0);
      setIsTimerRunning(false);
      setMode('timer');
      if (tracks && tracks.length > 0) {
        setSelectedTrack(tracks[0].id);
      }
    }
  }, [isOpen, tracks]);

  const handleFinish = () => {
    if (isTimerRunning) setIsTimerRunning(false);
    
    let duration = 0;
    if (mode === 'timer') {
      duration = Math.round(seconds / 60);
      if (duration === 0 && seconds > 0) duration = 1; // At least 1 min if they tried
    } else {
      duration = manualMinutes;
    }

    if (duration > 0 && selectedTrack) {
      addSession({
        trackId: selectedTrack,
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
                <p style={{ color: 'var(--text-secondary)' }}>You're getting closer to your goals.</p>
              </motion.div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Log Session</h2>
                  <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Select Track</label>
                  <select 
                    value={selectedTrack}
                    onChange={(e) => setSelectedTrack(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '1rem'
                    }}
                  >
                    {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-primary)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                  <button 
                    onClick={() => setMode('timer')}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, backgroundColor: mode === 'timer' ? 'var(--bg-secondary)' : 'transparent', color: mode === 'timer' ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: mode === 'timer' ? 'var(--shadow-sm)' : 'none', transition: 'var(--transition-smooth)' }}
                  >Timer</button>
                  <button 
                    onClick={() => setMode('manual')}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, backgroundColor: mode === 'manual' ? 'var(--bg-secondary)' : 'transparent', color: mode === 'manual' ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: mode === 'manual' ? 'var(--shadow-sm)' : 'none', transition: 'var(--transition-smooth)' }}
                  >Manual</button>
                </div>

                {mode === 'timer' ? (
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                      {formatTime(seconds)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                      {!isTimerRunning ? (
                        <button onClick={() => setIsTimerRunning(true)} className="btn-primary" style={{ width: '60px', height: '60px', padding: 0 }}>
                          <Play fill="currentColor" size={24} style={{ marginLeft: '4px' }} />
                        </button>
                      ) : (
                        <button onClick={() => setIsTimerRunning(false)} className="btn-primary" style={{ width: '60px', height: '60px', padding: 0, backgroundColor: 'var(--warning-color)' }}>
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
                        width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '1rem'
                      }}
                    />
                  </div>
                )}

                <button 
                  onClick={handleFinish} 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '1rem', backgroundColor: (mode === 'timer' && seconds === 0) ? 'var(--bg-tertiary)' : 'var(--success-color)' }}
                  disabled={mode === 'timer' && seconds === 0}
                >
                  <Check size={20} /> Finish Session
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
