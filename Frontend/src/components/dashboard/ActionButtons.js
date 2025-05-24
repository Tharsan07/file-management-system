import React from 'react';
import { PlusCircle, UploadCloud } from 'lucide-react';

const ActionButtons = ({ setIsModalOpen, uploadFile }) => {
  return (
    <div className="flex flex-wrap gap-4">
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-md transition-all"
      >
        <PlusCircle size={16} /> Add Folder
      </button>
      <label
        htmlFor="file-upload"
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-md cursor-pointer transition-all"
      >
        <UploadCloud size={16} /> Upload File
      </label>
      <input 
        id="file-upload" 
        type="file" 
        onChange={uploadFile} 
        className="hidden" 
      />
    </div>
  );
};

export default ActionButtons; 