import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { getSessions, getTracks } from '../lib/storage';
import ThemeToggle from '../components/ThemeToggle';
import ProfileModal from '../components/ProfileModal';

const Dashboard = () => {
  const [thisWeekMins, setThisWeekMins] = useState(0);
  const [dueGoals, setDueGoals] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const sessions = getSessions();
    const now = new Date();
    
    // Calculate start of this week (Monday)
    const thisWeekStart = new Date(now);
    const day = thisWeekStart.getDay() || 7;
    thisWeekStart.setDate(thisWeekStart.getDate() - day + 1);
    thisWeekStart.setHours(0, 0, 0, 0);

    let mins = 0;
    sessions.forEach(s => {
      const d = new Date(s.date);
      if (d >= thisWeekStart) {
        mins += s.durationMinutes;
      }
    });

    setThisWeekMins(mins);

    // Calculate Due Goals
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tracks = getTracks();
    const dues = [];

    const findDueGoals = (list, trackId, trackColor, trackName) => {
      list.forEach(g => {
        if (!g.completed && g.deadline) {
          const dDate = new Date(g.deadline);
          dDate.setHours(0, 0, 0, 0);
          if (dDate <= today) {
            dues.push({ ...g, trackId, trackColor, trackName, isOverdue: dDate < today });
          }
        }
        if (g.subGoals) {
          findDueGoals(g.subGoals, trackId, trackColor, trackName);
        }
      });
    };

    tracks.forEach(t => {
      if (!t.isCompleted && t.goals) {
        findDueGoals(t.goals, t.id, t.color, t.name);
      }
    });

    setDueGoals(dues);
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
      <header className="page-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Good Morning, Amay! 🌤️</h1>
          <p className="page-subtitle">Ready to glow up your skills today?</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <ThemeToggle />
          <motion.div 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsProfileOpen(true)}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: 'var(--accent-primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontWeight: 800, fontSize: '1.2rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            A
          </motion.div>
        </div>
      </header>

      {/* Summary Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem', marginBottom: '2.5rem', boxShadow: '0 10px 30px rgba(126, 168, 248, 0.15)', borderColor: 'var(--accent-primary)' }}>
        <div style={{ color: 'var(--accent-primary)', marginBottom: '0.75rem', backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '50%' }}>
          <Clock size={36} />
        </div>
        <h3 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          {formatMinutes(thisWeekMins)}
        </h3>
        <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Time This Week</span>
      </div>

      {/* Due Today */}
      {dueGoals.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="var(--error-color)" /> Due Today
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dueGoals.map((g, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={`${g.id}-${idx}`}
                className="card"
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '1rem', borderLeft: `4px solid ${g.trackColor}` 
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{g.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {g.trackName} • <span style={{ color: g.isOverdue ? 'var(--error-color)' : '#db2777' }}>
                      {g.isOverdue ? 'Overdue' : `Today, ${new Date(g.deadline).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}`}
                    </span>
                  </span>
                </div>
                <Link to={`/track/${g.trackId}`} style={{ color: 'var(--accent-primary)', padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '50%' }}>
                  <CheckCircle2 size={18} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}


      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </motion.div>
  );
};

export default Dashboard;
