import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, Play } from 'lucide-react';
import { getTracks, updateTrack } from '../lib/storage';
import SessionLogModal from '../components/SessionLogModal';

const TrackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [track, setTrack] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const tracks = getTracks();
    const foundTrack = tracks.find(t => t.id === id);
    if (foundTrack) {
      setTrack(foundTrack);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  const handleToggleGoal = (goalId) => {
    if (!track) return;

    const updatedGoals = track.goals.map(goal => 
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    );

    // Calculate XP gain (e.g., +10 XP per completion)
    const goal = track.goals.find(g => g.id === goalId);
    let newXp = track.xp;
    if (goal && !goal.completed) {
      newXp += 10;
    } else if (goal && goal.completed) {
      // Optional: deduct XP if unchecked, or just leave it. Let's deduct for realism.
      newXp = Math.max(0, newXp - 10);
    }

    const newLevel = Math.floor(newXp / 100) + 1;

    const updatedTrack = { ...track, goals: updatedGoals, xp: newXp, level: newLevel };
    setTrack(updatedTrack);
    updateTrack(updatedTrack);
  };

  if (!track) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      style={{ paddingBottom: '2rem' }}
    >
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', padding: '0.5rem', marginLeft: '-0.5rem' }}>
          <ChevronLeft size={24} />
          <span style={{ fontWeight: 600 }}>Back</span>
        </button>
      </header>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ 
          width: '16px', height: '16px', borderRadius: '50%', 
          backgroundColor: track.color || 'var(--accent-primary)' 
        }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {track.name}
        </h1>
      </div>

      {/* Level & XP Bar */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Level {track.level}</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{track.xp % 100} / 100 XP</span>
        </div>
        <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(track.xp % 100)}%` }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            style={{ height: '100%', backgroundColor: track.color || 'var(--accent-primary)', borderRadius: 'var(--radius-full)' }}
          />
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Goals & Checklists</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {track.goals.map((goal) => (
          <motion.div 
            key={goal.id}
            className="card"
            style={{ 
              padding: '1rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              cursor: 'pointer',
              opacity: goal.completed ? 0.6 : 1,
              backgroundColor: goal.completed ? 'var(--bg-primary)' : 'var(--bg-secondary)',
              borderStyle: goal.completed ? 'dashed' : 'solid'
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleToggleGoal(goal.id)}
          >
            <motion.div 
              style={{
                width: '24px', height: '24px', 
                borderRadius: '50%',
                border: `2px solid ${goal.completed ? track.color : 'var(--border-color)'}`,
                backgroundColor: goal.completed ? track.color : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              animate={goal.completed ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {goal.completed && <Check size={14} color="white" strokeWidth={3} />}
            </motion.div>
            <span style={{ 
              flex: 1, 
              fontWeight: 600, 
              textDecoration: goal.completed ? 'line-through' : 'none',
              transition: 'all 0.3s ease'
            }}>
              {goal.title}
            </span>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
        <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }} onClick={() => setIsModalOpen(true)}>
          <Play size={20} fill="currentColor" /> Log Session
        </button>
      </div>

      <SessionLogModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tracks={[track]} 
      />

    </motion.div>
  );
};

export default TrackDetail;
