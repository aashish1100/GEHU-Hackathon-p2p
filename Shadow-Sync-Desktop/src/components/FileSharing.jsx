import { motion } from 'framer-motion';

const FileSharing = () => {
  return (
    <motion.section
      className="bg-background-gray p-6 rounded-lg shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h2 className="text-2xl font-semibold text-text-light">Share Files Seamlessly</h2>
      <p className="text-text-muted mt-2">
        Share files easily with your peers on the same local network.
      </p>
      <motion.button
        className="mt-4 px-6 py-2 rounded-lg bg-success text-white hover:bg-green-700 transition-all"
        whileHover={{ scale: 1.1 }}
      >
        Share Files
      </motion.button>
    </motion.section>
  );
};

export default FileSharing;
