import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, Edit2, Trash2, Plus, Sparkles, CornerDownRight, Clock, Calendar } from 'lucide-react';
import { getTracks, updateTrack, deleteTrack, archiveTrack } from '../lib/storage';
import SessionLogModal from '../components/SessionLogModal';
import EditTrackModal from '../components/EditTrackModal';

const TrackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [track, setTrack] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeLogGoal, setActiveLogGoal] = useState(null);
  
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const [addingSubGoalFor, setAddingSubGoalFor] = useState(null); // stores { goalId, subGoalId } or just goalId string
  const [newSubGoalTitle, setNewSubGoalTitle] = useState('');

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

  const updateTrackData = (updatedGoals) => {
    const oldCompletedCount = track.goals.filter(g => g.completed).length;
    const newCompletedCount = updatedGoals.filter(g => g.completed).length;
    
    let newXp = track.xp + ((newCompletedCount - oldCompletedCount) * 10);
    newXp = Math.max(0, newXp);
    const newLevel = Math.floor(newXp / 100) + 1;

    const newTrack = { ...track, goals: updatedGoals, xp: newXp, level: newLevel };
    setTrack(newTrack);
    updateTrack(newTrack);
  };

  const handleToggleGoal = (goalId) => {
    if (!track) return;
    const goal = track.goals.find(g => g.id === goalId);
    if (!goal) return;
    const newCompleted = !goal.completed;
    
    const updatedSubGoals = (goal.subGoals || []).map(sg => ({ 
      ...sg, 
      completed: newCompleted,
      subGoals: (sg.subGoals || []).map(ssg => ({ ...ssg, completed: newCompleted }))
    }));
    
    const updatedGoals = track.goals.map(g => 
      g.id === goalId ? { ...g, completed: newCompleted, subGoals: updatedSubGoals } : g
    );
    updateTrackData(updatedGoals);
  };

  const handleToggleSubGoal = (goalId, subGoalId) => {
    if (!track) return;
    const goal = track.goals.find(g => g.id === goalId);
    if (!goal) return;
    const subGoal = (goal.subGoals || []).find(sg => sg.id === subGoalId);
    if (!subGoal) return;
    const newCompleted = !subGoal.completed;
    
    const updatedSubSubGoals = (subGoal.subGoals || []).map(ssg => ({ ...ssg, completed: newCompleted }));

    const updatedSubGoals = (goal.subGoals || []).map(sg => 
      sg.id === subGoalId ? { ...sg, completed: newCompleted, subGoals: updatedSubSubGoals } : sg
    );
    const allCompleted = updatedSubGoals.length > 0 && updatedSubGoals.every(sg => sg.completed);

    const updatedGoals = track.goals.map(g => 
      g.id === goalId ? { ...g, completed: allCompleted, subGoals: updatedSubGoals } : g
    );
    updateTrackData(updatedGoals);
  };

  const handleToggleSubSubGoal = (goalId, subGoalId, subSubGoalId) => {
    if (!track) return;
    const updatedGoals = track.goals.map(g => {
      if (g.id === goalId) {
        const updatedSubGoals = (g.subGoals || []).map(sg => {
          if (sg.id === subGoalId) {
            const updatedSubSubGoals = (sg.subGoals || []).map(ssg => 
              ssg.id === subSubGoalId ? { ...ssg, completed: !ssg.completed } : ssg
            );
            const allSubSubCompleted = updatedSubSubGoals.length > 0 && updatedSubSubGoals.every(ssg => ssg.completed);
            return { ...sg, subGoals: updatedSubSubGoals, completed: allSubSubCompleted };
          }
          return sg;
        });
        const allSubCompleted = updatedSubGoals.length > 0 && updatedSubGoals.every(sg => sg.completed);
        return { ...g, subGoals: updatedSubGoals, completed: allSubCompleted };
      }
      return g;
    });
    updateTrackData(updatedGoals);
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !track) return;
    const newGoal = { id: Date.now().toString(), title: newGoalTitle.trim(), completed: false, subGoals: [] };
    updateTrackData([...(track.goals || []), newGoal]);
    setNewGoalTitle('');
  };

  const handleDeleteGoal = (goalId, e) => {
    e.stopPropagation();
    if (!track) return;
    updateTrackData(track.goals.filter(g => g.id !== goalId));
  };

  const handleAddSubGoal = (goalId, e) => {
    e.preventDefault();
    if (!newSubGoalTitle.trim() || !track) return;
    const newSubGoal = { id: Date.now().toString(), title: newSubGoalTitle.trim(), completed: false };

    const updatedGoals = track.goals.map(g => {
      if (g.id === goalId) {
        const subGoals = [...(g.subGoals || []), newSubGoal];
        return { ...g, subGoals, completed: false }; // adding incomplete subgoal makes parent incomplete
      }
      return g;
    });
    updateTrackData(updatedGoals);
    setNewSubGoalTitle('');
    setAddingSubGoalFor(null);
  };

  const handleDeleteSubGoal = (goalId, subGoalId, e) => {
    e.stopPropagation();
    if (!track) return;
    const updatedGoals = track.goals.map(g => {
      if (g.id === goalId) {
        const subGoals = (g.subGoals || []).filter(sg => sg.id !== subGoalId);
        const allCompleted = subGoals.length > 0 ? subGoals.every(sg => sg.completed) : g.completed;
        return { ...g, subGoals, completed: allCompleted };
      }
      return g;
    });
    updateTrackData(updatedGoals);
  };

  const handleAddSubSubGoal = (goalId, subGoalId, e) => {
    e.preventDefault();
    if (!newSubGoalTitle.trim() || !track) return;
    const newSubSubGoal = { id: Date.now().toString(), title: newSubGoalTitle.trim(), completed: false };

    const updatedGoals = track.goals.map(g => {
      if (g.id === goalId) {
        const subGoals = (g.subGoals || []).map(sg => {
          if (sg.id === subGoalId) {
            const subSubGoals = [...(sg.subGoals || []), newSubSubGoal];
            return { ...sg, subGoals: subSubGoals, completed: false };
          }
          return sg;
        });
        return { ...g, subGoals, completed: false };
      }
      return g;
    });
    updateTrackData(updatedGoals);
    setNewSubGoalTitle('');
    setAddingSubGoalFor(null);
  };

  const handleDeleteSubSubGoal = (goalId, subGoalId, subSubGoalId, e) => {
    e.stopPropagation();
    if (!track) return;
    const updatedGoals = track.goals.map(g => {
      if (g.id === goalId) {
        const subGoals = (g.subGoals || []).map(sg => {
          if (sg.id === subGoalId) {
            const subSubGoals = (sg.subGoals || []).filter(ssg => ssg.id !== subSubGoalId);
            const allSubSubCompleted = subSubGoals.length > 0 ? subSubGoals.every(ssg => ssg.completed) : sg.completed;
            return { ...sg, subGoals: subSubGoals, completed: allSubSubCompleted };
          }
          return sg;
        });
        const allSubCompleted = subGoals.length > 0 ? subGoals.every(sg => sg.completed) : g.completed;
        return { ...g, subGoals, completed: allSubCompleted };
      }
      return g;
    });
    updateTrackData(updatedGoals);
  };

  const handleSetDeadline = (goalId, dateStr) => {
    if (!track) return;
    const updateDeep = (list) => {
      return list.map(item => {
        if (item.id === goalId) {
          return { ...item, deadline: dateStr };
        }
        if (item.subGoals) {
          return { ...item, subGoals: updateDeep(item.subGoals) };
        }
        return item;
      });
    };
    updateTrackData(updateDeep(track.goals));
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

  const openLogModalFor = (id, title) => {
    if (track && track.isCompleted) return;
    setActiveLogGoal({ id, title });
    setIsModalOpen(true);
  };

  const formatTimeBadge = (mins) => {
    if (!mins) return null;
    return (
      <span style={{ 
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', 
        backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: 800
      }}>
        <Clock size={10} /> {mins}m
      </span>
    );
  };

  const formatDeadlineBadge = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(deadline);
    date.setHours(0, 0, 0, 0);
    
    let color = 'var(--text-secondary)';
    let bg = 'var(--bg-tertiary)';
    if (date.getTime() === today.getTime()) {
      color = '#db2777'; // Pinkish
      bg = '#fce7f3';
    } else if (date < today) {
      color = 'var(--error-color)';
      bg = 'rgba(248, 113, 113, 0.1)';
    }

    return (
      <span style={{ 
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', 
        backgroundColor: bg, color: color, fontWeight: 800
      }}>
        <Calendar size={10} /> {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </span>
    );
  };

  const hasGoals = track?.goals && track.goals.length > 0;
  const isAllGoalsCompleted = hasGoals && track.goals.every(g => g.completed);

  useEffect(() => {
    if (track && isAllGoalsCompleted && !track.isCompleted) {
      const timer = setTimeout(() => {
        handleMoveToHistory();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [track, isAllGoalsCompleted]);

  if (!track) return null;

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
      <AnimatePresence>
        {isAllGoalsCompleted && !track.isCompleted && (
          <motion.div 
            key="completion-banner"
            initial={{ scale: 0.9, opacity: 0, y: 10, height: 0 }}
            animate={{ scale: 1, opacity: 1, y: 0, height: 'auto' }}
            exit={{ scale: 0.9, opacity: 0, height: 0 }}
            className="card"
            style={{ 
              backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--accent-primary)',
              boxShadow: '0 0 20px rgba(126, 168, 248, 0.3)', textAlign: 'center',
              marginBottom: '1.5rem', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '0.75rem', padding: '1.5rem', overflow: 'hidden'
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
              Congratulations! You've checked off all the goals in this track. Moving to History...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {track.isCompleted && (
        <div className="card" style={{ backgroundColor: 'var(--bg-primary)', borderStyle: 'dashed', textAlign: 'center', marginBottom: '1.5rem', padding: '1rem' }}>
          <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>🏆 Archived in History</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: track.color || 'var(--accent-primary)' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {track.name}
        </h1>
      </div>
      {track.description && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', paddingLeft: '2rem' }}>
          {track.description}
        </p>
      )}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Progress</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
            {hasGoals ? `${track.goals.filter(g => g.completed).length} / ${track.goals.length}` : '0 / 0'}
          </span>
        </div>
        <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: hasGoals ? `${(track.goals.filter(g => g.completed).length / track.goals.length) * 100}%` : '0%' }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            style={{ height: '100%', backgroundColor: track.color || 'var(--accent-primary)', borderRadius: 'var(--radius-full)' }}
          />
        </div>
      </div>

      {!track.isCompleted && (
        <form onSubmit={handleAddGoal} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input 
            type="text" value={newGoalTitle} onChange={(e) => setNewGoalTitle(e.target.value)}
            placeholder="Add new goal..."
            style={{
              flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem'
            }}
          />
          <button 
            type="submit" disabled={!newGoalTitle.trim()}
            style={{
              backgroundColor: newGoalTitle.trim() ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: newGoalTitle.trim() ? 'white' : 'var(--text-muted)',
              width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Plus size={20} />
          </button>
        </form>
      )}

      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>Goals</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {track.goals && track.goals.map((goal) => (
          <div key={goal.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            
            {/* LEVEL 1: Main Goal */}
            <motion.div 
              className="card"
              style={{ 
                padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', 
                opacity: goal.completed ? 0.6 : 1, backgroundColor: goal.completed ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                borderStyle: goal.completed ? 'dashed' : 'solid'
              }}
            >
              <div 
                onClick={() => !track.isCompleted && handleToggleGoal(goal.id)}
                style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  border: `2px solid ${goal.completed ? track.color : 'var(--border-color)'}`,
                  backgroundColor: goal.completed ? track.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, cursor: track.isCompleted ? 'default' : 'pointer'
                }}
              >
                {goal.completed && <Check size={12} color="white" strokeWidth={3} />}
              </div>
              
              <span 
                onClick={() => openLogModalFor(goal.id, goal.title)}
                style={{ 
                  flex: 1, fontWeight: 700, fontSize: '0.95rem',
                  textDecoration: goal.completed ? 'line-through' : 'none',
                  color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
                  cursor: track.isCompleted ? 'default' : 'pointer'
                }}>
                {goal.title}
                {formatTimeBadge(goal.timeSpent)}
                {formatDeadlineBadge(goal.deadline)}
                {goal.subGoals && goal.subGoals.length > 0 && (
                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: goal.completed ? 'var(--success-color)' : 'var(--bg-primary)', color: goal.completed ? 'white' : 'var(--text-secondary)', fontWeight: 800 }}>
                    {goal.completed ? 'Completed' : `${goal.subGoals.filter(sg => sg.completed).length}/${goal.subGoals.length}`}
                  </span>
                )}
              </span>

              {!track.isCompleted && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="date"
                      value={goal.deadline || ''}
                      onChange={(e) => handleSetDeadline(goal.id, e.target.value)}
                      style={{
                        position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 2
                      }}
                    />
                    <button style={{ color: 'var(--text-muted)', padding: '0.25rem' }}>
                      <Calendar size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={() => setAddingSubGoalFor(addingSubGoalFor === goal.id ? null : goal.id)}
                    style={{ color: 'var(--text-muted)', padding: '0.25rem', backgroundColor: addingSubGoalFor === goal.id ? 'var(--bg-tertiary)' : 'transparent', borderRadius: 'var(--radius-sm)', zIndex: 3, position: 'relative' }}
                  >
                    <Plus size={16} />
                  </button>
                  <button onClick={(e) => handleDeleteGoal(goal.id, e)} style={{ color: 'var(--error-color)', padding: '0.25rem', zIndex: 3, position: 'relative' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </motion.div>

            {/* LEVEL 2: Sub Goals */}
            {goal.subGoals && goal.subGoals.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '1.5rem' }}>
                {goal.subGoals.map((sg) => (
                  <div key={sg.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <motion.div 
                      style={{ 
                        padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', 
                        opacity: sg.completed ? 0.6 : 1, backgroundColor: sg.completed ? 'transparent' : 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', borderStyle: sg.completed ? 'dashed' : 'solid'
                      }}
                    >
                      <CornerDownRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      <div 
                        onClick={() => !track.isCompleted && handleToggleSubGoal(goal.id, sg.id)}
                        style={{
                          width: '18px', height: '18px', borderRadius: '4px',
                          border: `2px solid ${sg.completed ? track.color : 'var(--border-color)'}`,
                          backgroundColor: sg.completed ? track.color : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, cursor: track.isCompleted ? 'default' : 'pointer'
                        }}
                      >
                        {sg.completed && <Check size={10} color="white" strokeWidth={3} />}
                      </div>
                      
                      <span 
                        onClick={() => openLogModalFor(sg.id, sg.title)}
                        style={{ 
                          flex: 1, fontWeight: 600, fontSize: '0.875rem',
                          textDecoration: sg.completed ? 'line-through' : 'none', color: 'var(--text-primary)',
                          display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: track.isCompleted ? 'default' : 'pointer'
                        }}>
                        {sg.title}
                        {formatTimeBadge(sg.timeSpent)}
                        {formatDeadlineBadge(sg.deadline)}
                      </span>

                      {!track.isCompleted && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="date"
                              value={sg.deadline || ''}
                              onChange={(e) => handleSetDeadline(sg.id, e.target.value)}
                              style={{
                                position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 2
                              }}
                            />
                            <button style={{ color: 'var(--text-muted)', padding: '0.25rem' }}>
                              <Calendar size={14} />
                            </button>
                          </div>
                          <button 
                            onClick={() => setAddingSubGoalFor(addingSubGoalFor === `${goal.id}-${sg.id}` ? null : `${goal.id}-${sg.id}`)}
                            style={{ color: 'var(--text-muted)', padding: '0.25rem', backgroundColor: addingSubGoalFor === `${goal.id}-${sg.id}` ? 'var(--bg-tertiary)' : 'transparent', borderRadius: 'var(--radius-sm)', zIndex: 3, position: 'relative' }}
                          >
                            <Plus size={14} />
                          </button>
                          <button onClick={(e) => handleDeleteSubGoal(goal.id, sg.id, e)} style={{ color: 'var(--text-muted)', padding: '0.25rem', zIndex: 3, position: 'relative' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </motion.div>

                    {/* LEVEL 3: Sub-Sub Goals */}
                    {sg.subGoals && sg.subGoals.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '2rem' }}>
                        {sg.subGoals.map((ssg) => (
                          <motion.div 
                            key={ssg.id}
                            style={{ 
                              padding: '0.375rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', 
                              opacity: ssg.completed ? 0.6 : 1, backgroundColor: 'transparent',
                              borderRadius: 'var(--radius-md)'
                            }}
                          >
                            <CornerDownRight size={12} color="var(--border-color)" style={{ flexShrink: 0 }} />
                            <div 
                              onClick={() => !track.isCompleted && handleToggleSubSubGoal(goal.id, sg.id, ssg.id)}
                              style={{
                                width: '16px', height: '16px', borderRadius: '4px',
                                border: `2px solid ${ssg.completed ? track.color : 'var(--border-color)'}`,
                                backgroundColor: ssg.completed ? track.color : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, cursor: track.isCompleted ? 'default' : 'pointer'
                              }}
                            >
                              {ssg.completed && <Check size={10} color="white" strokeWidth={3} />}
                            </div>
                            
                            <span 
                              onClick={() => openLogModalFor(ssg.id, ssg.title)}
                              style={{ 
                                flex: 1, fontWeight: 500, fontSize: '0.8125rem',
                                textDecoration: ssg.completed ? 'line-through' : 'none', color: 'var(--text-secondary)',
                                display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: track.isCompleted ? 'default' : 'pointer'
                              }}>
                              {ssg.title}
                              {formatTimeBadge(ssg.timeSpent)}
                              {formatDeadlineBadge(ssg.deadline)}
                            </span>

                            {!track.isCompleted && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ position: 'relative' }}>
                                  <input 
                                    type="date"
                                    value={ssg.deadline || ''}
                                    onChange={(e) => handleSetDeadline(ssg.id, e.target.value)}
                                    style={{
                                      position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 2
                                    }}
                                  />
                                  <button style={{ color: 'var(--text-muted)', padding: '0.25rem' }}>
                                    <Calendar size={12} />
                                  </button>
                                </div>
                                <button onClick={(e) => handleDeleteSubSubGoal(goal.id, sg.id, ssg.id, e)} style={{ color: 'var(--text-muted)', padding: '0.25rem', zIndex: 3, position: 'relative' }}>
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Add Sub-Sub Goal Form */}
                    {addingSubGoalFor === `${goal.id}-${sg.id}` && !track.isCompleted && (
                      <form onSubmit={(e) => handleAddSubSubGoal(goal.id, sg.id, e)} style={{ display: 'flex', gap: '0.5rem', paddingLeft: '2rem', marginTop: '0.25rem' }}>
                        <input 
                          type="text" value={newSubGoalTitle} onChange={(e) => setNewSubGoalTitle(e.target.value)}
                          placeholder="Add deeper goal..." autoFocus
                          style={{
                            flex: 1, padding: '0.375rem 0.5rem', borderRadius: 'var(--radius-sm)',
                            border: '1px dashed var(--border-color)', backgroundColor: 'transparent',
                            color: 'var(--text-primary)', outline: 'none', fontSize: '0.8125rem'
                          }}
                        />
                        <button 
                          type="submit" disabled={!newSubGoalTitle.trim()}
                          style={{
                            backgroundColor: newSubGoalTitle.trim() ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                            color: newSubGoalTitle.trim() ? 'white' : 'var(--text-muted)',
                            padding: '0 0.75rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.75rem'
                          }}
                        >
                          Add
                        </button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Sub Goal Form */}
            {addingSubGoalFor === goal.id && !track.isCompleted && (
              <form onSubmit={(e) => handleAddSubGoal(goal.id, e)} style={{ display: 'flex', gap: '0.5rem', paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                <input 
                  type="text" value={newSubGoalTitle} onChange={(e) => setNewSubGoalTitle(e.target.value)}
                  placeholder="Add sub-goal..." autoFocus
                  style={{
                    flex: 1, padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)',
                    border: '1px dashed var(--border-color)', backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem'
                  }}
                />
                <button 
                  type="submit" disabled={!newSubGoalTitle.trim()}
                  style={{
                    backgroundColor: newSubGoalTitle.trim() ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: newSubGoalTitle.trim() ? 'white' : 'var(--text-muted)',
                    padding: '0 1rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.875rem'
                  }}
                >
                  Add
                </button>
              </form>
            )}
          </div>
        ))}

        {!hasGoals && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No goals yet. Add your first goal above!
          </div>
        )}
      </div>

      <SessionLogModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setActiveLogGoal(null);
          loadTrack(); // reload stats and timeSpent
        }} 
        trackId={track.id}
        selectedGoal={activeLogGoal}
      />

      <EditTrackModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} track={track} onUpdate={(updated) => setTrack(updated)} />

      {showConfirmDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ width: '100%', maxWidth: '320px', textAlign: 'center', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Delete Track?</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Are you sure you want to delete "{track.name}" and all its goals?</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowConfirmDelete(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', fontWeight: 700 }}>Cancel</button>
              <button onClick={handleDeleteTrack} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--error-color)', color: 'white', fontWeight: 700 }}>Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default TrackDetail;
