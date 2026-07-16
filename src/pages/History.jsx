import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCcw, Trash2, Calendar } from 'lucide-react';
import { getTracks, restoreTrack, deleteTrack } from '../lib/storage';

const History = () => {
  const navigate = useNavigate();
  const [completedTracks, setCompletedTracks] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(null); // stores trackId to delete

  useEffect(() => {
    loadCompletedTracks();
  }, []);

  const loadCompletedTracks = () => {
    const allTracks = getTracks();
    setCompletedTracks(allTracks.filter(t => t.isCompleted));
  };

  const handleRestore = (id, e) => {
    e.stopPropagation();
    restoreTrack(id);
    loadCompletedTracks();
  };

  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    setShowConfirmDelete(id);
  };

  const confirmDelete = () => {
    if (showConfirmDelete) {
      deleteTrack(showConfirmDelete);
      loadCompletedTracks();
      setShowConfirmDelete(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">Completed Tracks</h1>
          <p className="page-subtitle">Your learning milestones and history.</p>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {completedTracks.map((track) => (
          <div 
            key={track.id}
            className="card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '0.75rem',
              opacity: 0.85,
              cursor: 'pointer'
            }}
            onClick={() => navigate(`/track/${track.id}`)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '16px', height: '16px', borderRadius: '50%', 
                  backgroundColor: track.color || 'var(--accent-primary)' 
                }} />
                <h3 style={{ fontWeight: 800, fontSize: '1.25rem', textDecoration: 'line-through', color: 'var(--text-secondary)' }}>{track.name}</h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                Lv {track.level}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={14} /> 
                {track.completedAt 
                  ? new Date(track.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Completed'}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={(e) => handleRestore(track.id, e)} 
                  style={{
                    backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)',
                    padding: '0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700
                  }}
                >
                  <RotateCcw size={14} /> Restore
                </button>
                <button 
                  onClick={(e) => handleDeleteClick(track.id, e)} 
                  style={{
                    backgroundColor: 'var(--bg-primary)', color: 'var(--error-color)',
                    padding: '0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {completedTracks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            No completed tracks yet. Keep learning to achieve your goals!
          </div>
        )}
      </div>

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
              Are you sure you want to permanently delete this track? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setShowConfirmDelete(null)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', fontWeight: 700 }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
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

export default History;
