import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { updateTrack } from '../lib/storage';

const COLORS = [
  '#7ea8f8', // Primary Blue
  '#a3c4f9', // Secondary Blue
  '#8be0b6', // Mint
  '#ffa8a8', // Soft Pink
  '#ffe08a', // Soft Yellow
  '#c0a8ff', // Soft Purple
];

const EditTrackModal = ({ isOpen, onClose, track, onUpdate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (track) {
      setName(track.name);
      setDescription(track.description || '');
      setColor(track.color || COLORS[0]);
    }
  }, [track]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !track) return;

    const updated = updateTrack({
      ...track,
      name: name.trim(),
      description: description.trim(),
      color: color
    });

    onUpdate(updated);
    onClose();
  };

  if (!isOpen || !track) return null;

  return (
    <AnimatePresence>
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
          left: 0,
          right: 0,
          margin: '0 auto',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Edit Track</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Track Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. IELTS Writing, Python Basics..."
              autoFocus
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Description (Optional)</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this track about?"
              rows={2}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem',
                resize: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Color Theme</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%', backgroundColor: c,
                    border: color === c ? '3px solid var(--text-primary)' : '2px solid transparent',
                    transition: 'var(--transition-smooth)'
                  }}
                />
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '1rem' }}
            disabled={!name.trim()}
          >
            <Save size={20} /> Save Changes
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditTrackModal;
