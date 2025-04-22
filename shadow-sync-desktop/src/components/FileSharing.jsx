/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaFileUpload } from 'react-icons/fa';

const FileItem = ({ fileName }) => (
  <motion.div
    className="flex items-center justify-between p-3 bg-background-gray rounded-lg shadow-md mb-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <span className="text-light">{fileName}</span>
    <button className="bg-primary text-white rounded-lg p-2 hover:bg-primary-dark transition-all">
      <FaDownload />
    </button>
  </motion.div>
);

const FileSharing = () => {
  const [files, setFiles] = useState([]);
  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles([...files, ...uploadedFiles]);
  };

  return (
    <div className="flex flex-col p-6 h-full">
      <div className="mb-6">
        <label
          htmlFor="file-upload"
          className="block text-primary text-lg font-semibold mb-2"
        >
          <FaFileUpload className="inline-block mr-2" />
          Upload Files
        </label>
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileUpload}
          className="p-3 w-full rounded-lg border border-border-gray bg-background-gray text-light focus:outline-none"
        />
      </div>
      <div>
        {files.length > 0 ? (
          files.map((file, index) => <FileItem key={index} fileName={file.name} />)
        ) : (
          <p className="text-muted">No files uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default FileSharing;
