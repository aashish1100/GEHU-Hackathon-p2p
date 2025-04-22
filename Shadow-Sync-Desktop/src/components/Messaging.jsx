import { motion } from 'framer-motion';
import './Messaging.css';

const Messaging = () => {
  return (
    <motion.section
      className="messaging"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <h2 className="messaging-title">Messaging</h2>
      <p className="messaging-description">
        Instantly message your peers during the lab session.
      </p>
      <motion.button
        className="start-messaging-btn"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.98 }}
      >
        Start Messaging
      </motion.button>
    </motion.section>
  );
};

export default Messaging;
