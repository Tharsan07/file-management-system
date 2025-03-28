import React, { useState, useEffect } from "react";

const FolderCreationModal = ({ isOpen, onClose, onCreate }) => {
  const [companyCode, setCompanyCode] = useState("");
  const [year, setYear] = useState("");
  const [assemblyCode, setAssemblyCode] = useState("");
  const [companies, setCompanies] = useState([]);
  const [assemblyCodes, setAssemblyCodes] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/company-codes");
        const data = await response.json();
        setCompanies(data.codes || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };

    const fetchAssemblyCodes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/assembly-codes");
        const data = await response.json();
        setAssemblyCodes(data.codes || []);
      } catch (err) {
        console.error("Error fetching assembly codes:", err);
      }
    };

    fetchCompanies();
    fetchAssemblyCodes();
  }, []);

  const handleCreate = () => {
    onCreate(year, companyCode, assemblyCode);
    setCompanyCode("");
    setYear("");
    setAssemblyCode("");
    onClose();
  };

  if (!isOpen) return null;

  // Generate years for the dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Create Folder</h3>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="input-field"
          style={{ color: "black" }}
        >
          <option value="" disabled>Select Year</option>
          {years.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </select>
        <select
          value={companyCode}
          onChange={(e) => setCompanyCode(e.target.value)}
          className="input-field"
          style={{ color: "black" }}
        >
          <option value="" disabled>Select Company Code</option>
          {companies.map((company) => (
            <option key={company.code} value={company.code}>
              {company.code}
            </option>
          ))}
        </select>
        <select
          value={assemblyCode}
          onChange={(e) => setAssemblyCode(e.target.value)}
          className="input-field"
          style={{ color: "black" }}
        >
          <option value="" disabled>Select Assembly Code</option>
          {assemblyCodes.map((assembly) => (
            <option key={assembly.code} value={assembly.code}>
              {assembly.code}
            </option>
          ))}
        </select>
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
