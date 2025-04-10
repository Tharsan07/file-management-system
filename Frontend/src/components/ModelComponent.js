import React, { useState, useEffect } from "react";

const FolderCreationModal = ({ isOpen, onClose, onCreate }) => {
  const [customName, setCustomName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [year, setYear] = useState("");
  const [assemblyCode, setAssemblyCode] = useState("");
  const [companies, setCompanies] = useState([]);
  const [assemblyCodes, setAssemblyCodes] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/company-codes");
        const data = await response.json();
        setCompanies(data.codes || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };

    const fetchAssemblyCodes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/assembly-codes");
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
    const parts = [customName, year, companyCode, assemblyCode].filter(Boolean);
    const finalFolderName = parts.join("-") || "Untitled-Folder";

    onCreate(finalFolderName);
    setCustomName("");
    setCompanyCode("");
    setYear("");
    setAssemblyCode("");
    onClose();
  };

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">Create New Folder</h3>

        <input
          type="text"
          placeholder="Custom Folder Name"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          className="w-full p-3 mb-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full p-3 mb-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        >
          <option value="">Select Year</option>
          {years.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </select>

        <select
          value={companyCode}
          onChange={(e) => setCompanyCode(e.target.value)}
          className="w-full p-3 mb-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        >
          <option value="">Select Company Code</option>
          {companies.map((company) => (
            <option key={company.code} value={company.code}>
              {company.code} - {company.name}
            </option>
          ))}
        </select>

        <select
          value={assemblyCode}
          onChange={(e) => setAssemblyCode(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        >
          <option value="">Select Assembly Code</option>
          {assemblyCodes.map((assembly) => (
            <option key={assembly.code} value={assembly.code}>
              {assembly.code} - {assembly.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderCreationModal;
