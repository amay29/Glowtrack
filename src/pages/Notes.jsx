import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getNotes, addNote } from '../lib/storage';
import { Plus } from 'lucide-react';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const added = addNote({ content: newNote.trim() });
    setNotes([added, ...notes]);
    setNewNote('');
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
          <h1 className="page-title">Quick Notes</h1>
          <p className="page-subtitle">Jot down vocabularies, ideas, or insights.</p>
        </div>
      </header>

      <form onSubmit={handleAddNote} style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Type your note here..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '1rem',
              paddingBottom: '3rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              resize: 'vertical',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: 'var(--shadow-sm)',
              transition: 'var(--transition-smooth)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
          <button 
            type="submit"
            disabled={!newNote.trim()}
            style={{
              position: 'absolute',
              bottom: '1rem',
              right: '1rem',
              backgroundColor: newNote.trim() ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: newNote.trim() ? 'white' : 'var(--text-muted)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-bounce)'
            }}
          >
            <Plus size={20} />
          </button>
        </div>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notes.map(note => (
          <motion.div 
            key={note.id} 
            className="card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{note.content}</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
              {new Date(note.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </motion.div>
        ))}
        {notes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No notes yet. Start typing above!
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Notes;
