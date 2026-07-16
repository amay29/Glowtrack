import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { getTracks } from '../lib/storage';
import AddTrackModal from '../components/AddTrackModal';

const Tracks = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const allTracks = getTracks();
    setTracks(allTracks.filter(t => !t.isCompleted));
  }, []);

  const handleAddTrack = (newTrack) => {
    setTracks([newTrack, ...tracks]);
    setIsAddModalOpen(false);
    navigate(`/track/${newTrack.id}`);
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
          <h1 className="page-title">Learning Tracks</h1>
          <p className="page-subtitle">Organize and conquer your goals.</p>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="card"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            border: '2px dashed var(--border-color)', backgroundColor: 'transparent',
            color: 'var(--accent-primary)', fontWeight: 700, padding: '1.5rem',
            boxShadow: 'none'
          }}
        >
          <Plus size={20} /> Add New Track
        </button>

        {tracks.map((track) => (
          <motion.div 
            layout
            key={track.id}
            className="card" 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/track/${track.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '16px', height: '16px', borderRadius: '50%', 
                  backgroundColor: track.color || 'var(--accent-primary)' 
                }} />
                <h3 style={{ fontWeight: 800, fontSize: '1.25rem' }}>{track.name}</h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                {track.goals && track.goals.length > 0 ? `${track.goals.filter(g => g.completed).length}/${track.goals.length}` : '0/0'}
              </span>
            </div>
            
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: track.goals && track.goals.length > 0 ? `${(track.goals.filter(g => g.completed).length / track.goals.length) * 100}%` : '0%' }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ height: '100%', backgroundColor: track.color || 'var(--accent-primary)' }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <AddTrackModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddTrack}
      />
    </motion.div>
  );
};

export default Tracks;
