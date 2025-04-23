import React, { useRef, useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';

const FileUpload = ({ onUpload }) => {
  const fileRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [fileList, setFileList] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => onUpload(file));
    setFileList(files);
    fileRef.current.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(file => onUpload(file));
    setFileList(droppedFiles);
  };

  return (
    <div className="bg-background-dark rounded-lg p-6 shadow-md border border-border-gray space-y-4 relative">
      <div
        className={`border-2 border-dashed p-6 rounded-lg cursor-pointer transition-all duration-300 ease-in-out 
          ${isDragging ? 'border-primary bg-background-gray' : 'border-secondary hover:bg-background-gray'}`}
        onClick={() => fileRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FaCloudUploadAlt
          className={`text-4xl mb-2 mx-auto transition-all duration-300 ease-in-out 
            ${isDragging ? 'text-primary' : 'text-secondary hover:text-primary'}`}
        />
        <p className="text-light text-sm text-center">
          {isDragging ? 'Drop files to upload' : 'Click or drag files to upload'}
        </p>
      </div>

      {fileList.length > 0 && (
        <div className="mt-4">
          <ul className="space-y-2">
            {fileList.map((file, index) => (
              <li key={index} className="flex items-center justify-between text-light text-sm">
                <span className="truncate max-w-[80%]">{file.name}</span>
                <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(2)} KB</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <input
        type="file"
        hidden
        ref={fileRef}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        multiple
      />
    </div>
  );
};

export default FileUpload;
