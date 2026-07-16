import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Flame, Zap, TrendingUp } from 'lucide-react';
import { getUserStats, getTracks } from '../lib/storage';

const ProfileModal = ({ isOpen, onClose }) => {
  const stats = getUserStats();
  const tracks = getTracks();
  
  // Calculate Global Level (sum of all track levels)
  const globalLevel = tracks.reduce((sum, t) => sum + (t.level || 1), 0);
  const totalXP = tracks.reduce((sum, t) => sum + (t.xp || 0), 0);
  const completedTracks = tracks.filter(t => t.isCompleted).length;

  if (!isOpen) return null;

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
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={24} color="var(--accent-primary)" /> Your Profile
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', fontWeight: 600 }}>
                  Master of your own progress
                </p>
              </div>
              <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Flame size={32} color="#fbbf24" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.currentStreak}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Day Streak</span>
              </div>
              
              <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <TrendingUp size={32} color="var(--success-color)" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{globalLevel}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Global Level</span>
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Zap size={24} color="var(--accent-primary)" />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total XP Earned</span>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{totalXP}</span>
            </div>

            <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Award size={24} color="#db2777" />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Tracks Completed</span>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#db2777' }}>{completedTracks}</span>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
