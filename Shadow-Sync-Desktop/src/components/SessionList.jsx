import { motion } from 'framer-motion';
import './SessionList.css';

const SessionList = () => {
  return (
    <motion.section
      className="session-list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h2 className="session-list-title">Active Sessions</h2>
      <ul className="sessions">
        <li className="session-item">Session 1</li>
        <li className="session-item">Session 2</li>
        <li className="session-item">Session 3</li>
      </ul>
    </motion.section>
  );
};

export default SessionList;
