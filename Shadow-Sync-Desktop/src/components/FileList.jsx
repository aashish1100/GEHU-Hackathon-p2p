import { motion } from 'framer-motion';
import './FileList.css';

const FileList = () => {
  return (
    <motion.section
      className="file-list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h2 className="file-list-title">Shared Files</h2>
      <ul className="files">
        <li className="file-item">File 1.txt</li>
        <li className="file-item">File 2.pdf</li>
        <li className="file-item">Image.jpg</li>
      </ul>
    </motion.section>
  );
};

export default FileList;
