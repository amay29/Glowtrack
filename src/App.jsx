import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Tracks from './pages/Tracks';
import TrackDetail from './pages/TrackDetail';
import Notes from './pages/Notes';
import History from './pages/History';
import Stats from './pages/Stats';
import { initDemoData, getTracks, getNotifiedGoals, addNotifiedGoal } from './lib/storage';
import './App.css';

function App() {
  useEffect(() => {
    initDemoData();

    // Request Notification Permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkDeadlines = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      
      const tracks = getTracks();
      const notified = getNotifiedGoals();
      const now = new Date();
      
      // 24 hours in milliseconds
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;

      const checkGoal = (goal, trackName) => {
        if (!goal.completed && goal.deadline && !notified.includes(goal.id)) {
          const deadlineDate = new Date(goal.deadline);
          const timeDiff = deadlineDate.getTime() - now.getTime();
          
          // If deadline is within the next 24 hours (and not in the past)
          if (timeDiff > 0 && timeDiff <= ONE_DAY_MS) {
            new Notification(`Glowtrack Reminder`, {
              body: `Your goal "${goal.title}" in ${trackName} is due in less than 24 hours!`,
              icon: '/icon-192x192.png'
            });
            addNotifiedGoal(goal.id);
          } else if (timeDiff < 0 && timeDiff > -ONE_DAY_MS) {
             // "Rapel" notification: if it became overdue recently and we missed the 24h window
            new Notification(`Glowtrack Overdue`, {
              body: `Your goal "${goal.title}" in ${trackName} is overdue!`,
              icon: '/icon-192x192.png'
            });
            addNotifiedGoal(goal.id);
          }
        }
        
        if (goal.subGoals) {
          goal.subGoals.forEach(sg => checkGoal(sg, trackName));
        }
      };

      tracks.forEach(track => {
        if (!track.isCompleted && track.goals) {
          track.goals.forEach(g => checkGoal(g, track.name));
        }
      });
    };

    // Check immediately and then every minute
    checkDeadlines();
    const intervalId = setInterval(checkDeadlines, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Router>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tracks" element={<Tracks />} />
            <Route path="/track/:id" element={<TrackDetail />} />
            <Route path="/history" element={<History />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/notes" element={<Notes />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
