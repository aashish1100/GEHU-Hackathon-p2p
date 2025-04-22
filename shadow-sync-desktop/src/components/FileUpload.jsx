import React, { useRef } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';

const FileUpload = ({ onUpload }) => {
  const fileRef = useRef();

  return (
    <div className="bg-background-dark rounded-lg p-6 shadow-md border border-border-gray space-y-4">
      <div
        className="border-2 border-dashed border-secondary p-6 rounded-lg cursor-pointer hover:bg-background-gray transition-all duration-300 ease-in-out hover:shadow-lg hover:translate-y-1"
        onClick={() => fileRef.current.click()}
      >
        <FaCloudUploadAlt className="text-4xl text-secondary mb-2 mx-auto transition-all duration-300 ease-in-out hover:text-primary" />
        <p className="text-light text-sm">Click or drag file to upload</p>
      </div>

      <input
        type="file"
        hidden
        ref={fileRef}
        onChange={onUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
};

export default FileUpload;
