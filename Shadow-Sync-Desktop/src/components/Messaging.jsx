import { motion } from 'framer-motion';

const Messaging = () => {
  return (
    <motion.section
      className="mt-8 bg-background-gray p-6 rounded-lg shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h2 className="text-2xl font-semibold text-text-light">Messaging</h2>
      <p className="text-text-muted mt-2">
        Instantly message your peers during the lab session.
      </p>
      <motion.button
        className="mt-4 px-6 py-2 rounded-lg bg-warning text-white hover:bg-yellow-600 transition-all"
        whileHover={{ scale: 1.1 }}
      >
        Start Messaging
      </motion.button>
    </motion.section>
  );
};

export default Messaging;
