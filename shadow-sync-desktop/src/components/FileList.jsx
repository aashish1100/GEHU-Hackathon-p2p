import React from 'react';
import { FaFileAlt } from 'react-icons/fa';

const FileList = ({ files = [] }) => {
  return (
    <div className="bg-background-dark mt-6 p-6 rounded-lg shadow-lg border border-border-gray">
      <h3 className="text-light text-lg font-semibold mb-4">Shared Files</h3>
      <ul className="space-y-3">
        {files.map((file, idx) => (
          <li
            key={idx}
            className="flex items-center gap-4 p-3 bg-background-gray rounded-lg cursor-pointer hover:bg-background-dark hover:shadow-lg transition-all duration-300 ease-in-out"
          >
            <FaFileAlt className="text-secondary text-2xl transform transition-all duration-300 ease-in-out hover:text-primary" />
            <span className="text-light text-sm">{file.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
