import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, List, NotebookPen, History, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink 
        to="/" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        {({ isActive }) => (
          <>
            <motion.div whileTap={{ scale: 0.8 }} animate={{ y: isActive ? -2 : 0 }}>
              <Home size={22} strokeWidth={isActive ? 2.5 : 2} />
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
              <List size={22} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span>Tracks</span>
          </>
        )}
      </NavLink>

      <NavLink 
        to="/history" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        {({ isActive }) => (
          <>
            <motion.div whileTap={{ scale: 0.8 }} animate={{ y: isActive ? -2 : 0 }}>
              <History size={22} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span>History</span>
          </>
        )}
      </NavLink>

      <NavLink 
        to="/stats" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        {({ isActive }) => (
          <>
            <motion.div whileTap={{ scale: 0.8 }} animate={{ y: isActive ? -2 : 0 }}>
              <PieChart size={22} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span>Stats</span>
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
              <NotebookPen size={22} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span>Notes</span>
          </>
        )}
      </NavLink>
    </nav>
  );
};

export default BottomNav;
