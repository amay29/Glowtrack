import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, List, NotebookPen } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();

  // Hide nav on specific pages if needed
  // if (location.pathname.includes('/track/')) return null;

  return (
    <nav className="bottom-nav">
      <NavLink 
        to="/" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        {({ isActive }) => (
          <>
            <motion.div whileTap={{ scale: 0.8 }} animate={{ y: isActive ? -2 : 0 }}>
              <Home size={24} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span>Home</span>
          </>
        )}
      </NavLink>

      <NavLink 
        to="/tracks" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        {({ isActive }) => (
          <>
            <motion.div whileTap={{ scale: 0.8 }} animate={{ y: isActive ? -2 : 0 }}>
              <List size={24} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span>Tracks</span>
          </>
        )}
      </NavLink>

      <NavLink 
        to="/notes" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        {({ isActive }) => (
          <>
            <motion.div whileTap={{ scale: 0.8 }} animate={{ y: isActive ? -2 : 0 }}>
              <NotebookPen size={24} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span>Notes</span>
          </>
        )}
      </NavLink>
    </nav>
  );
};

export default BottomNav;
