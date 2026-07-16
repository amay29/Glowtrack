import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Trash2 } from 'lucide-react';

const TrackOptionsModal = ({ isOpen, onClose, track, onEdit, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);

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
          left: 0, right: 0, margin: '0 auto',
          width: '100%', maxWidth: '480px',
          backgroundColor: 'var(--bg-secondary)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          padding: '1.5rem', paddingBottom: '3rem',
          zIndex: 101, boxShadow: 'var(--shadow-lg)',
          maxHeight: '90vh', overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{track.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Track Options</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
        </div>

        {showConfirm ? (
          <div style={{ backgroundColor: 'var(--error-color)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'white', textAlign: 'center' }}>
            <h3 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Are you sure?</h3>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem', opacity: 0.9 }}>This will permanently delete the track and all its goals.</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-sm)', fontWeight: 600, color: 'white' }}>Cancel</button>
              <button onClick={() => { onDelete(track.id); onClose(); setShowConfirm(false); }} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'white', color: 'var(--error-color)', borderRadius: 'var(--radius-sm)', fontWeight: 800 }}>Yes, Delete</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              onClick={() => { onEdit(track); onClose(); }}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', fontWeight: 700, color: 'var(--text-primary)' }}
            >
              <Edit2 size={20} color="var(--accent-primary)" /> Edit Track
            </button>
            <button 
              onClick={() => setShowConfirm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', fontWeight: 700, color: 'var(--error-color)' }}
            >
              <Trash2 size={20} /> Delete Track
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default TrackOptionsModal;
