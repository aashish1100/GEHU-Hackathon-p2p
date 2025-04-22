import { motion } from 'framer-motion';
import './FileUpload.css';

const FileUpload = () => {
  return (
    <motion.section
      className="file-upload"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h2 className="file-upload-title">Upload Files</h2>
      <input type="file" className="file-input" />
      <button className="upload-button">Upload</button>
    </motion.section>
  );
};

export default FileUpload;
