import React from 'react';
import { FiFile } from 'react-icons/fi';
import { formatBytes } from '../utils/format.js';

const FileList = ({ files }) => {
  return (
    <div className="bg-background-dark rounded-lg p-6 shadow-md border border-border-gray">
      <h3 className="text-light font-semibold mb-4">Uploaded Files</h3>
      <div className="space-y-3">
        {files.map((file, index) => (
          <div key={index} className="flex items-center p-3 bg-background-gray rounded-lg hover:bg-gray-800 transition-colors">
            <FiFile className="text-secondary mr-3 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-light text-sm truncate">{file.name}</p>
              <p className="text-muted text-xs">{formatBytes(file.size)}</p>
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <p className="text-muted text-sm text-center py-4">No files uploaded yet</p>
        )}
      </div>
    </div>
  );
};

export default FileList;