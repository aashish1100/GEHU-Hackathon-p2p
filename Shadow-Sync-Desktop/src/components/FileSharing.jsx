import { motion } from 'framer-motion';
import './FileSharing.css';

const FileSharing = () => {
  return (
    <motion.section
      className="file-sharing"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <h2 className="file-sharing-title">Share Files Seamlessly</h2>
      <p className="file-sharing-description">
        Share files easily with your peers on the same local network.
      </p>
      <motion.button
        className="share-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        Share Files
      </motion.button>
    </motion.section>
  );
};

export default FileSharing;
