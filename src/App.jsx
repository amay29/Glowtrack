import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import TrackDetail from './pages/TrackDetail';
import Notes from './pages/Notes';
import { initDemoData } from './lib/storage';
import './App.css';

function App() {
  useEffect(() => {
    initDemoData();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tracks" element={<div>Tracks Page (Under Construction)</div>} />
            <Route path="/track/:id" element={<TrackDetail />} />
            <Route path="/notes" element={<Notes />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
