import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Flame, Clock } from 'lucide-react';
import { getTracks, getUserStats } from '../lib/storage';
import SessionLogModal from '../components/SessionLogModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [stats, setStats] = useState({ currentStreak: 0, lastStudyDate: null });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setTracks(getTracks());
    setStats(getUserStats());
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">Good Morning, Amay! 🌤️</h1>
          <p className="page-subtitle">Ready to glow up your skills today?</p>
        </div>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--warning-color)', marginBottom: '0.25rem' }}>
            <Flame size={28} fill="currentColor" />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.currentStreak}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Day Streak</span>
        </div>
        
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
            <Clock size={28} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>4h 30m</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>This Week</span>
        </div>
      </div>

      {/* Your Tracks */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Your Tracks</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tracks.map((track) => (
          <motion.div 
            key={track.id}
            className="card" 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/track/${track.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '12px', height: '12px', borderRadius: '50%', 
                  backgroundColor: track.color || 'var(--accent-primary)' 
                }} />
                <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>{track.name}</h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                Lv {track.level}
              </span>
            </div>
            
            {/* Simple Progress Bar */}
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(track.xp % 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ height: '100%', backgroundColor: track.color || 'var(--accent-primary)' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{track.xp % 100}/100 XP to next level</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button className="fab" onClick={() => setIsModalOpen(true)}>
        <Play fill="currentColor" size={24} style={{ marginLeft: '4px' }} />
      </button>

      <SessionLogModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          // Refresh stats
          setStats(getUserStats());
        }} 
        tracks={tracks} 
      />

    </motion.div>
  );
};

export default Dashboard;
