import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { getSessions, getTracks } from '../lib/storage';

const CircularProgress = ({ thisWeek, lastWeek }) => {
  const size = 240;
  const strokeWidth = 16;
  const center = size / 2;
  const outerRadius = center - strokeWidth;
  const innerRadius = outerRadius - strokeWidth - 8;
  
  // To avoid dividing by zero, max against 1 min
  const maxVal = Math.max(thisWeek, lastWeek, 1);
  const outerCircumference = 2 * Math.PI * outerRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;
  
  const outerDashoffset = outerCircumference - (thisWeek / maxVal) * outerCircumference;
  const innerDashoffset = innerCircumference - (lastWeek / maxVal) * innerCircumference;
  
  const diff = thisWeek - lastWeek;
  const isUp = diff >= 0;
  const percentChange = lastWeek > 0 ? Math.round((Math.abs(diff) / lastWeek) * 100) : (thisWeek > 0 ? 100 : 0);

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background Circles */}
        <circle cx={center} cy={center} r={innerRadius} fill="none" stroke="var(--bg-secondary)" strokeWidth={strokeWidth} />
        <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="var(--bg-secondary)" strokeWidth={strokeWidth} />
        
        {/* Inner Circle (Last Week) */}
        <motion.circle
          cx={center} cy={center} r={innerRadius}
          fill="none" stroke="var(--text-muted)" strokeWidth={strokeWidth}
          strokeDasharray={innerCircumference}
          initial={{ strokeDashoffset: innerCircumference }}
          animate={{ strokeDashoffset: innerDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          strokeLinecap="round"
          style={{ opacity: 0.5 }}
        />
        
        {/* Outer Circle (This Week) */}
        <motion.circle
          cx={center} cy={center} r={outerRadius}
          fill="none" stroke="var(--accent-primary)" strokeWidth={strokeWidth}
          strokeDasharray={outerCircumference}
          initial={{ strokeDashoffset: outerCircumference }}
          animate={{ strokeDashoffset: outerDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 8px rgba(126, 168, 248, 0.5))' }}
        />
      </svg>
      
      {/* Center Text */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            color: isUp ? 'var(--success-color)' : 'var(--error-color)',
            fontWeight: 800, fontSize: '1.5rem'
          }}
        >
          {isUp ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          {percentChange}%
        </motion.div>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>vs last week</span>
      </div>
    </div>
  );
};

const Stats = () => {
  const [trendData, setTrendData] = useState({ thisWeek: 0, lastWeek: 0 });
  const [trackStats, setTrackStats] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const sessions = getSessions();
    const tracks = getTracks();
    const now = new Date();
    
    // Calculate week bounds
    const thisWeekStart = new Date(now);
    const day = thisWeekStart.getDay() || 7;
    thisWeekStart.setDate(thisWeekStart.getDate() - day + 1);
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    let thisWeek = 0;
    let lastWeek = 0;
    const trackMins = {};

    sessions.forEach(s => {
      const d = new Date(s.date);
      if (d >= thisWeekStart) {
        thisWeek += s.durationMinutes;
        // Accumulate track stats for this week
        if (s.trackId) {
          trackMins[s.trackId] = (trackMins[s.trackId] || 0) + s.durationMinutes;
        }
      } else if (d >= lastWeekStart && d < thisWeekStart) {
        lastWeek += s.durationMinutes;
      }
    });

    setTrendData({ thisWeek, lastWeek });

    // Format track stats
    const tStats = Object.keys(trackMins).map(tid => {
      const t = tracks.find(tr => tr.id === tid);
      return {
        id: tid,
        name: t ? t.name : 'Deleted Track',
        color: t ? t.color : 'var(--text-muted)',
        mins: trackMins[tid]
      };
    }).sort((a, b) => b.mins - a.mins);

    setTrackStats(tStats);
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
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Track your glowing progress.</p>
        </div>
      </header>

      <div className="card" style={{ marginBottom: '2rem', padding: '2rem 1rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '2rem' }}>Weekly Comparison</h3>
        <CircularProgress thisWeek={trendData.thisWeek} lastWeek={trendData.lastWeek} />
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} /> Last Week
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{formatMinutes(trendData.lastWeek)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} /> This Week
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{formatMinutes(trendData.thisWeek)}</div>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Award size={20} color="var(--warning-color)" /> Focus Distribution (This Week)
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {trackStats.length > 0 ? trackStats.map((ts, idx) => (
          <motion.div 
            key={ts.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card"
            style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: ts.color }} />
              <span style={{ fontWeight: 700 }}>{ts.name}</span>
            </div>
            <span style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>{formatMinutes(ts.mins)}</span>
          </motion.div>
        )) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
            No focus time recorded this week yet.
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default Stats;
