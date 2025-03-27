import React, { useState } from "react";

const FolderCreationModal = ({ isOpen, onClose, onCreate }) => {
  const [companyCode, setCompanyCode] = useState("");
  const [year, setYear] = useState("");
  const [assemblyCode, setAssemblyCode] = useState("");

  const handleCreate = () => {
    onCreate(year,companyCode, assemblyCode);
    setCompanyCode("");
    setYear("");
    setAssemblyCode("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Create Folder</h3>
        <input
          type="text"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Company Code"
          value={companyCode}
          onChange={(e) => setCompanyCode(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Assembly Code"
          value={assemblyCode}
          onChange={(e) => setAssemblyCode(e.target.value)}
          className="input-field"
        />
        <div className="modal-actions">
          <button onClick={handleCreate} className="btn btn-blue">
            Create
          </button>
          <button onClick={onClose} className="btn btn-gray">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderCreationModal;
