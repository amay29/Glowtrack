import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, Play, Edit2, Trash2, Plus, Sparkles } from 'lucide-react';
import { getTracks, updateTrack, deleteTrack, archiveTrack } from '../lib/storage';
import SessionLogModal from '../components/SessionLogModal';
import EditTrackModal from '../components/EditTrackModal';

const TrackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [track, setTrack] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    loadTrack();
  }, [id]);

  const loadTrack = () => {
    const tracks = getTracks();
    const foundTrack = tracks.find(t => t.id === id);
    if (foundTrack) {
      setTrack(foundTrack);
    } else {
      navigate('/');
    }
  };

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
      newXp = Math.max(0, newXp - 10);
    }

    const newLevel = Math.floor(newXp / 100) + 1;

    const updatedTrack = { ...track, goals: updatedGoals, xp: newXp, level: newLevel };
    setTrack(updatedTrack);
    updateTrack(updatedTrack);
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !track) return;

    const newGoal = {
      id: Date.now().toString(),
      title: newGoalTitle.trim(),
      completed: false
    };

    const updatedTrack = {
      ...track,
      goals: [...(track.goals || []), newGoal]
    };

    setTrack(updatedTrack);
    updateTrack(updatedTrack);
    setNewGoalTitle('');
  };

  const handleDeleteGoal = (goalId, e) => {
    e.stopPropagation();
    if (!track) return;

    const updatedGoals = track.goals.filter(g => g.id !== goalId);
    const updatedTrack = { ...track, goals: updatedGoals };
    setTrack(updatedTrack);
    updateTrack(updatedTrack);
  };

  const handleDeleteTrack = () => {
    if (track) {
      deleteTrack(track.id);
      navigate('/');
    }
  };

  const handleMoveToHistory = () => {
    if (track) {
      archiveTrack(track.id);
      navigate('/history');
    }
  };

  if (!track) return null;

  // Check if all goals are completed
  const hasGoals = track.goals && track.goals.length > 0;
  const isAllGoalsCompleted = hasGoals && track.goals.every(g => g.completed);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      style={{ paddingBottom: '3rem' }}
    >
      <header className="page-header" style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', padding: '0.5rem', marginLeft: '-0.5rem' }}>
          <ChevronLeft size={24} />
          <span style={{ fontWeight: 600 }}>Back</span>
        </button>
        
        {!track.isCompleted && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setIsEditOpen(true)} style={{ color: 'var(--text-secondary)', padding: '0.5rem' }}>
              <Edit2 size={20} />
            </button>
            <button onClick={() => setShowConfirmDelete(true)} style={{ color: 'var(--error-color)', padding: '0.5rem' }}>
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </header>

      {/* Completion Banner */}
      {isAllGoalsCompleted && !track.isCompleted && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="card"
          style={{ 
            backgroundColor: 'var(--bg-tertiary)', 
            borderColor: 'var(--accent-primary)',
            boxShadow: '0 0 20px rgba(126, 168, 248, 0.3)',
            textAlign: 'center',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1.5rem'
          }}
        >
          <div style={{ color: 'var(--accent-primary)', display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
            <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Sparkles size={24} />
            </motion.div>
            <h3 style={{ fontWeight: 800 }}>Track Completed!</h3>
            <motion.div animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>
              <Sparkles size={24} />
            </motion.div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Congratulations! You've checked off all the goals in this track.
          </p>
          <button 
            onClick={handleMoveToHistory} 
            className="btn-primary" 
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem' }}
          >
            Move to History
          </button>
        </motion.div>
      )}

      {track.isCompleted && (
        <div 
          className="card"
          style={{ 
            backgroundColor: 'var(--bg-primary)', 
            borderStyle: 'dashed',
            textAlign: 'center',
            marginBottom: '1.5rem',
            padding: '1rem'
          }}
        >
          <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>🏆 Archived in History</span>
        </div>
      )}

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
      <div className="card" style={{ marginBottom: '1.5rem' }}>
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

      {/* Goal Add Form */}
      {!track.isCompleted && (
        <form onSubmit={handleAddGoal} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            placeholder="Add new goal..."
            style={{
              flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem'
            }}
          />
          <button 
            type="submit" 
            disabled={!newGoalTitle.trim()}
            style={{
              backgroundColor: newGoalTitle.trim() ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: newGoalTitle.trim() ? 'white' : 'var(--text-muted)',
              width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'var(--transition-bounce)'
            }}
          >
            <Plus size={20} />
          </button>
        </form>
      )}

      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>Goals & Checklists</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {track.goals && track.goals.map((goal) => (
          <motion.div 
            key={goal.id}
            className="card"
            style={{ 
              padding: '0.875rem 1rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              cursor: track.isCompleted ? 'default' : 'pointer',
              opacity: goal.completed ? 0.6 : 1,
              backgroundColor: goal.completed ? 'var(--bg-primary)' : 'var(--bg-secondary)',
              borderStyle: goal.completed ? 'dashed' : 'solid'
            }}
            whileTap={track.isCompleted ? {} : { scale: 0.99 }}
            onClick={() => !track.isCompleted && handleToggleGoal(goal.id)}
          >
            <motion.div 
              style={{
                width: '22px', height: '22px', 
                borderRadius: '50%',
                border: `2px solid ${goal.completed ? track.color : 'var(--border-color)'}`,
                backgroundColor: goal.completed ? track.color : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}
              animate={goal.completed ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {goal.completed && <Check size={12} color="white" strokeWidth={3} />}
            </motion.div>
            
            <span style={{ 
              flex: 1, 
              fontWeight: 600, 
              fontSize: '0.95rem',
              textDecoration: goal.completed ? 'line-through' : 'none',
              transition: 'all 0.3s ease',
              color: 'var(--text-primary)'
            }}>
              {goal.title}
            </span>

            {!track.isCompleted && (
              <button 
                onClick={(e) => handleDeleteGoal(goal.id, e)}
                style={{ color: 'var(--text-muted)', padding: '0.25rem' }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </motion.div>
        ))}

        {!hasGoals && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No goals yet. Add your first goal above!
          </div>
        )}
      </div>

      {!track.isCompleted && (
        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
          <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }} onClick={() => setIsModalOpen(true)}>
            <Play size={20} fill="currentColor" /> Log Session
          </button>
        </div>
      )}

      {/* Modals */}
      <SessionLogModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          loadTrack(); // reload stats if leveling up
        }} 
        tracks={[track]} 
      />

      <EditTrackModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        track={track}
        onUpdate={(updated) => setTrack(updated)}
      />

      {/* Confirmation Modal */}
      {showConfirmDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem'
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card"
            style={{ width: '100%', maxWidth: '320px', textAlign: 'center', padding: '1.5rem' }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Delete Track?</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Are you sure you want to delete "{track.name}" and all its goals?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setShowConfirmDelete(false)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', fontWeight: 700 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteTrack}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--error-color)', color: 'white', fontWeight: 700 }}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default TrackDetail;
