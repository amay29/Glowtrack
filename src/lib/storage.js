// Local storage keys
const KEYS = {
  TRACKS: 'glowtrack_tracks',
  SESSIONS: 'glowtrack_sessions',
  NOTES: 'glowtrack_notes',
  USER_STATS: 'glowtrack_user_stats',
};

// Generic get/set
const getItem = (key, defaultValue) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
};

const setItem = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage`, error);
  }
};

// Tracks
export const getTracks = () => getItem(KEYS.TRACKS, []);
export const saveTracks = (tracks) => setItem(KEYS.TRACKS, tracks);

export const addTrack = (track) => {
  const tracks = getTracks();
  const newTrack = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    name: track.name,
    color: track.color || 'var(--accent-primary)',
    level: 1,
    xp: 0,
    goals: track.goals || [], // { id, title, completed }
    isCompleted: false,
    ...track
  };
  saveTracks([...tracks, newTrack]);
  return newTrack;
};

export const updateTrack = (updatedTrack) => {
  const tracks = getTracks();
  const newTracks = tracks.map(t => t.id === updatedTrack.id ? updatedTrack : t);
  saveTracks(newTracks);
  return updatedTrack;
};

export const deleteTrack = (id) => {
  const tracks = getTracks();
  const newTracks = tracks.filter(t => t.id !== id);
  saveTracks(newTracks);
  
  // Optionally clean up sessions related to this track
  const sessions = getSessions();
  const newSessions = sessions.filter(s => s.trackId !== id);
  saveSessions(newSessions);
};

export const archiveTrack = (id) => {
  const tracks = getTracks();
  const newTracks = tracks.map(t => t.id === id ? { ...t, isCompleted: true, completedAt: new Date().toISOString() } : t);
  saveTracks(newTracks);
};

export const restoreTrack = (id) => {
  const tracks = getTracks();
  const newTracks = tracks.map(t => t.id === id ? { ...t, isCompleted: false } : t);
  saveTracks(newTracks);
};

// Sessions
export const getSessions = () => getItem(KEYS.SESSIONS, []);
export const saveSessions = (sessions) => setItem(KEYS.SESSIONS, sessions);

const recursivelyUpdateGoalTime = (goals, targetGoalId, addedMinutes) => {
  let found = false;
  const newGoals = goals.map(g => {
    if (g.id === targetGoalId) {
      found = true;
      return { ...g, timeSpent: (g.timeSpent || 0) + addedMinutes };
    }
    
    if (g.subGoals && g.subGoals.length > 0) {
      const { updatedGoals, wasFound } = recursivelyUpdateGoalTime(g.subGoals, targetGoalId, addedMinutes);
      if (wasFound) {
        found = true;
        // If a child was updated, accumulate time to parent too
        return { ...g, subGoals: updatedGoals, timeSpent: (g.timeSpent || 0) + addedMinutes };
      }
    }
    
    return g;
  });
  
  return { updatedGoals: newGoals, wasFound: found };
};

export const addSession = (session) => {
  const sessions = getSessions();
  const newSession = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    durationMinutes: session.durationMinutes || 0,
    trackId: session.trackId,
    goalId: session.goalId || null,
    note: session.note || '',
    ...session
  };
  saveSessions([...sessions, newSession]);
  
  // Update timeSpent in tracks if goalId exists
  if (session.goalId && session.trackId) {
    const tracks = getTracks();
    const trackIndex = tracks.findIndex(t => t.id === session.trackId);
    if (trackIndex !== -1) {
      const track = tracks[trackIndex];
      const { updatedGoals, wasFound } = recursivelyUpdateGoalTime(track.goals || [], session.goalId, newSession.durationMinutes);
      if (wasFound) {
        const newTracks = [...tracks];
        newTracks[trackIndex] = { ...track, goals: updatedGoals };
        saveTracks(newTracks);
      }
    }
  }
  
  // Update stats
  updateStreak();
  
  return newSession;
};

// Notes
export const getNotes = () => getItem(KEYS.NOTES, []);
export const saveNotes = (notes) => setItem(KEYS.NOTES, notes);
export const addNote = (note) => {
  const notes = getNotes();
  const newNote = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    content: note.content || '',
    ...note
  };
  saveNotes([newNote, ...notes]);
  return newNote;
};

export const updateNote = (id, updatedContent) => {
  const notes = getNotes();
  const newNotes = notes.map(n => n.id === id ? { ...n, content: updatedContent, updatedAt: new Date().toISOString() } : n);
  saveNotes(newNotes);
};

export const deleteNote = (id) => {
  const notes = getNotes();
  const newNotes = notes.filter(n => n.id !== id);
  saveNotes(newNotes);
};

// User Stats & Streak
export const getUserStats = () => getItem(KEYS.USER_STATS, { currentStreak: 0, lastStudyDate: null });
export const saveUserStats = (stats) => setItem(KEYS.USER_STATS, stats);

const updateStreak = () => {
  const stats = getUserStats();
  const today = new Date().toISOString().split('T')[0];
  
  if (!stats.lastStudyDate) {
    stats.currentStreak = 1;
    stats.lastStudyDate = today;
  } else {
    const lastDate = new Date(stats.lastStudyDate);
    const currentDate = new Date(today);
    
    // Calculate difference in days
    const diffTime = Math.abs(currentDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Studied yesterday
      stats.currentStreak += 1;
      stats.lastStudyDate = today;
    } else if (diffDays > 1) {
      // Missed a day
      stats.currentStreak = 1;
      stats.lastStudyDate = today;
    }
    // If diffDays === 0, they already studied today, streak remains same
  }
  
  saveUserStats(stats);
};

// Initial Demo Data
export const initDemoData = () => {
  const tracks = getTracks();
  if (tracks.length === 0) {
    saveTracks([
      {
        id: '1',
        createdAt: new Date().toISOString(),
        name: 'English Speaking',
        color: 'var(--accent-primary)',
        level: 3,
        xp: 450,
        isCompleted: false,
        goals: [
          { id: 'g1', title: 'Practice introduction', completed: true },
          { id: 'g2', title: 'Learn 5 new vocabularies', completed: false },
          { id: 'g3', title: 'Record a 2-min audio', completed: false }
        ]
      },
      {
        id: '2',
        createdAt: new Date().toISOString(),
        name: 'Business Strategy',
        color: 'var(--success-color)',
        level: 1,
        xp: 120,
        isCompleted: false,
        goals: [
          { id: 'g4', title: 'Read chapter 1', completed: false }
        ]
      }
    ]);
  }
};
