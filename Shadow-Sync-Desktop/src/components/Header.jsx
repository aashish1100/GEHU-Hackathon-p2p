import { motion } from 'framer-motion';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <motion.h1
        className="header-title"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        Shadow Sync
      </motion.h1>
      <motion.button
        className="start-session-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        Start Session
      </motion.button>
    </header>
  );
};

export default Header;
