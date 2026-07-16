import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Flame, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { getUserStats, getSessions } from '../lib/storage';
import SessionLogModal from '../components/SessionLogModal';

const Dashboard = () => {
  const [stats, setStats] = useState({ currentStreak: 0, lastStudyDate: null });
  const [trend, setTrend] = useState({ thisWeekMins: 0, diff: 0, isUp: true });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStats(getUserStats());
    calculateTrend();
  };

  const calculateTrend = () => {
    const sessions = getSessions();
    const now = new Date();
    
    // Calculate start of this week (Monday)
    const thisWeekStart = new Date(now);
    const day = thisWeekStart.getDay() || 7;
    thisWeekStart.setDate(thisWeekStart.getDate() - day + 1);
    thisWeekStart.setHours(0, 0, 0, 0);

    // Calculate start of last week
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    let thisWeekMins = 0;
    let lastWeekMins = 0;

    sessions.forEach(s => {
      const d = new Date(s.date);
      if (d >= thisWeekStart) {
        thisWeekMins += s.durationMinutes;
      } else if (d >= lastWeekStart && d < thisWeekStart) {
        lastWeekMins += s.durationMinutes;
      }
    });

    const diff = thisWeekMins - lastWeekMins;
    setTrend({
      thisWeekMins,
      diff: Math.abs(diff),
      isUp: diff >= 0
    });
  };

  const formatMinutes = (totalMins) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ paddingBottom: '2rem' }}
    >
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Good Morning, Amay! 🌤️</h1>
          <p className="page-subtitle">Ready to glow up your skills today?</p>
        </div>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--warning-color)', marginBottom: '0.25rem' }}>
            <Flame size={28} fill="currentColor" />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.currentStreak}</h3>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Day Streak</span>
        </div>
        
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
            <Clock size={28} />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{formatMinutes(trend.thisWeekMins)}</h3>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>This Week</span>
          
          {/* Trend Indicator */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.25rem', 
            fontSize: '0.75rem', fontWeight: 700,
            color: trend.isUp ? 'var(--success-color)' : 'var(--error-color)',
            backgroundColor: trend.isUp ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
            padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)'
          }}>
            {trend.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{formatMinutes(trend.diff)} vs last week</span>
          </div>
        </div>
      </div>

      {/* Main Focus / Quick Log CTA */}
      <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', backgroundColor: 'var(--bg-secondary)', borderStyle: 'dashed' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Keep the momentum going!</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Log a quick session to build your habit.
        </p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary" 
          style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Play size={20} fill="currentColor" /> Log Session
        </button>
      </div>

      <SessionLogModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          loadData();
        }} 
      />

    </motion.div>
  );
};

export default Dashboard;
