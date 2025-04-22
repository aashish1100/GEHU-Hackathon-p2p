import { motion } from 'framer-motion';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 15 }}
    >
      <h2 className="sidebar-title">Active Sessions</h2>
      <ul className="session-list">
        <li className="session-item">Session 1</li>
        <li className="session-item">Session 2</li>
        <li className="session-item">Session 3</li>
      </ul>
    </motion.aside>
  );
};

export default Sidebar;
