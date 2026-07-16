import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, Edit2, Trash2, Check, X } from 'lucide-react';
import { getNotes, addNote, updateNote, deleteNote } from '../lib/storage';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(null); // stores note id to delete

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    setNotes(getNotes());
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    addNote({ content: newNote.trim() });
    setNewNote('');
    loadNotes();
  };
  
  const handleStartEdit = (note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };
  
  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      updateNote(editingId, editContent.trim());
      setEditingId(null);
      setEditContent('');
      loadNotes();
    }
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };
  
  const handleDeleteClick = (id) => {
    setShowConfirmDelete(id);
  };
  
  const confirmDelete = () => {
    if (showConfirmDelete) {
      deleteNote(showConfirmDelete);
      loadNotes();
      setShowConfirmDelete(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ paddingBottom: '2rem' }}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">Reflections</h1>
          <p className="page-subtitle">Jot down your "Aha!" moments.</p>
        </div>
      </header>

      <form onSubmit={handleAddNote} style={{ marginBottom: '2rem' }}>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="What did you learn today?"
          style={{
            width: '100%', minHeight: '120px', padding: '1rem',
            borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)',
            outline: 'none', resize: 'none', marginBottom: '0.75rem',
            fontSize: '1rem', fontFamily: 'inherit'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={!newNote.trim()}
            style={{ 
              opacity: newNote.trim() ? 1 : 0.5,
              padding: '0.75rem 1.5rem'
            }}
          >
            Save Note
          </button>
        </div>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notes.map((note) => (
          <motion.div 
            key={note.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            {editingId === note.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', minHeight: '100px', padding: '0.75rem',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-primary)',
                    backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
                    outline: 'none', resize: 'none', fontSize: '1rem', fontFamily: 'inherit'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button 
                    onClick={handleCancelEdit}
                    style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    disabled={!editContent.trim()}
                    style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--success-color)', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Check size={16} /> Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <Calendar size={14} />
                    <span>{new Date(note.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleStartEdit(note)} style={{ color: 'var(--text-muted)', padding: '0.25rem', backgroundColor: 'transparent' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(note.id)} style={{ color: 'var(--error-color)', padding: '0.25rem', backgroundColor: 'transparent' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {note.content}
                </p>
              </>
            )}
          </motion.div>
        ))}

        {notes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <BookOpen size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
            <p>Your notebook is empty.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmDelete && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card"
              style={{ width: '100%', maxWidth: '320px', textAlign: 'center', padding: '1.5rem' }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Delete Note?</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Are you sure you want to permanently delete this note?
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
      </AnimatePresence>
    </motion.div>
  );
};

export default Notes;
