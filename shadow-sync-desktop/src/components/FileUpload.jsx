import React, { useRef, useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';

const FileUpload = ({ onUpload }) => {
  const fileRef = useRef();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
      fileRef.current.value = '';
    }
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
    const file = e.dataTransfer.files[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="bg-background-dark rounded-lg p-6 shadow-md border border-border-gray space-y-4">
      <div
        className={`border-2 border-dashed p-6 rounded-lg cursor-pointer transition-all duration-300 ease-in-out 
          ${isDragging ? 'border-primary bg-background-gray' : 'border-secondary hover:bg-background-gray'}`}
        onClick={() => fileRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FaCloudUploadAlt className={`text-4xl mb-2 mx-auto transition-all duration-300 ease-in-out 
          ${isDragging ? 'text-primary' : 'text-secondary hover:text-primary'}`} />
        <p className="text-light text-sm text-center">
          {isDragging ? 'Drop file to upload' : 'Click or drag file to upload'}
        </p>
      </div>

      <input
        type="file"
        hidden
        ref={fileRef}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
};

export default FileUpload;