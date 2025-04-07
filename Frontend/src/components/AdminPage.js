import React, { useState, useEffect } from "react";
import { Trash2, PlusCircle } from "lucide-react"; // Import Lucide React icons
import Header from "./header";

export default function AdminPage({ setPage }) {
  const [companies, setCompanies] = useState([]);
  const [assemblyCodes, setAssemblyCodes] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [assemblyName, setAssemblyName] = useState("");
  const [assemblyCode, setAssemblyCode] = useState("");

  useEffect(() => {
    fetchCompanies();
    fetchAssemblyCodes();
  }, []);

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

  const addCompany = async () => {
    if (!companyName || !companyCode) return alert("Enter both fields");
    const response = await fetch("http://localhost:5000/api/admin/add-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: companyName, code: companyCode }),
    });

    if (response.ok) {
      fetchCompanies();
      setCompanyName("");
      setCompanyCode("");
    } else {
      alert("Failed to add company");
    }
  };

  const addAssembly = async () => {
    if (!assemblyName || !assemblyCode) return alert("Enter both fields");
    const response = await fetch("http://localhost:5000/api/admin/add-assembly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: assemblyName, code: assemblyCode }),
    });

    if (response.ok) {
      fetchAssemblyCodes();
      setAssemblyName("");
      setAssemblyCode("");
    } else {
      alert("Failed to add assembly");
    }
  };

  const deleteCompany = async (code) => {
    if (!window.confirm("Are you sure?")) return;
    const response = await fetch("http://localhost:5000/api/admin/delete-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (response.ok) {
      fetchCompanies();
    } else {
      alert("Failed to delete company");
    }
  };

  const deleteAssembly = async (code) => {
    if (!window.confirm("Are you sure?")) return;
    const response = await fetch("http://localhost:5000/api/admin/delete-assembly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (response.ok) {
      fetchAssemblyCodes();
    } else {
      alert("Failed to delete assembly");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <Header />

      {/* Back Button */}
      <div className="p-4 flex justify-between items-center bg-white border-b border-gray-200 shadow-sm">
        <h1 className="text-lg font-bold">Admin Panel</h1>
        <button
          onClick={() => setPage("dashboard")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Management */}
        <div className="bg-white p-6 rounded-md shadow-sm">
          <h2 className="text-xl font-bold mb-4">Manage Companies</h2>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-600 outline-none"
              />
              <input
                type="text"
                placeholder="Company Code"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-600 outline-none"
              />
              <button
                onClick={addCompany}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all"
              >
                <PlusCircle size={16} /> Add
              </button>
            </div>
            <ul className="space-y-2">
              {companies.length === 0 ? (
                <p className="text-center text-gray-600">No Companies Added</p>
              ) : (
                companies.map((c) => (
                  <li
                    key={c.code}
                    className="flex justify-between items-center p-2 border border-gray-200 rounded-md"
                  >
                    <span className="text-gray-700">{c.name} ({c.code})</span>
                    <button
                      onClick={() => deleteCompany(c.code)}
                      className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 transition-all"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Assembly Management */}
        <div className="bg-white p-6 rounded-md shadow-sm">
          <h2 className="text-xl font-bold mb-4">Manage Assemblies</h2>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Assembly Name"
                value={assemblyName}
                onChange={(e) => setAssemblyName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-600 outline-none"
              />
              <input
                type="text"
                placeholder="Assembly Code"
                value={assemblyCode}
                onChange={(e) => setAssemblyCode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-600 outline-none"
              />
              <button
                onClick={addAssembly}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all"
              >
                <PlusCircle size={16} /> Add
              </button>
            </div>
            <ul className="space-y-2">
              {assemblyCodes.length === 0 ? (
                <p className="text-center text-gray-600">No Assemblies Added</p>
              ) : (
                assemblyCodes.map((a) => (
                  <li
                    key={a.code}
                    className="flex justify-between items-center p-2 border border-gray-200 rounded-md"
                  >
                    <span className="text-gray-700">{a.name} ({a.code})</span>
                    <button
                      onClick={() => deleteAssembly(a.code)}
                      className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 transition-all"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}