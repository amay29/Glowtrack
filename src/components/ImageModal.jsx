import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';

const ImageModal = ({ isOpen, onClose, imageUrl, onDelete }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
        onClick={onClose}
      >
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '1rem' }}>
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); onClose(); }}
              style={{ color: 'white', backgroundColor: 'rgba(255,59,48,0.8)', padding: '0.5rem', borderRadius: '50%' }}
            >
              <Trash2 size={24} />
            </button>
          )}
          <button 
            onClick={onClose} 
            style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%' }}
          >
            <X size={24} />
          </button>
        </div>
        
        <motion.img 
          src={imageUrl}
          alt="Goal Attachment"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: 'var(--radius-md)'
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageModal;
