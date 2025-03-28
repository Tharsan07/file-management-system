import { useState, useEffect } from "react";
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

  const addCompany = async () => {
    if (!companyName || !companyCode) return alert("Enter both fields");
    const response = await fetch("http://localhost:5000/api/add-company", {
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
    const response = await fetch("http://localhost:5000/api/add-assembly", {
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
    const response = await fetch("http://localhost:5000/api/delete-company", {
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
    const response = await fetch("http://localhost:5000/api/delete-assembly", {
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
    <div className="min-h-screen p-5 bg-gradient-to-br from-gray-100 to-blue-100">
      <Header />
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Panel</h1>
        <button
          onClick={() => setPage("dashboard")}
          className="bg-blue-500 text-white border border-blue-500 px-4 py-2 rounded-md hover:shadow-md transition duration-200"
        >
          ← Back to Dashboard
        </button>
      </header>

      <div className="flex flex-wrap gap-5 justify-center">
        {/* Company Management */}
        <div className="flex-1 min-w-[400px] bg-white p-5 rounded-lg border border-gray-200 shadow-md">
          <h3 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Manage Companies
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={`flex-1 min-w-[180px] p-2.5 border rounded-md focus:border-blue-500 outline-none transition ${
                companyName ? "text-black" : ""
              }`}
            />
            <input
              type="text"
              placeholder="Company Code"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              className={`flex-1 min-w-[180px] p-2.5 border rounded-md focus:border-blue-500 outline-none transition ${
                companyCode ? "text-black" : ""
              }`}
            />
            <button
              onClick={addCompany}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:shadow-md transition duration-200"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {companies.length === 0 ? (
              <p className="text-gray-500">No Companies Added</p>
            ) : (
              companies.map((c) => (
                <li
                  key={c.code}
                  className="flex justify-between items-center p-2.5 border rounded-md bg-gray-50 hover:shadow-md transition duration-200"
                >
                  <span className="text-gray-800">
                    {c.name} ({c.code})
                  </span>
                  <button
                    onClick={() => deleteCompany(c.code)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:shadow-md transition duration-200"
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Assembly Management */}
        <div className="flex-1 min-w-[400px] bg-white p-5 rounded-lg border border-gray-200 shadow-md">
          <h3 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Manage Assemblies
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              type="text"
              placeholder="Assembly Name"
              value={assemblyName}
              onChange={(e) => setAssemblyName(e.target.value)}
              className={`flex-1 min-w-[180px] p-2.5 border rounded-md focus:border-blue-500 outline-none transition ${
                assemblyName ? "text-black" : ""
              }`}
            />
            <input
              type="text"
              placeholder="Assembly Code"
              value={assemblyCode}
              onChange={(e) => setAssemblyCode(e.target.value)}
              className={`flex-1 min-w-[180px] p-2.5 border rounded-md focus:border-blue-500 outline-none transition ${
                assemblyCode ? "text-black" : ""
              }`}
            />
            <button
              onClick={addAssembly}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:shadow-md transition duration-200"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {assemblyCodes.length === 0 ? (
              <p className="text-gray-500">No Assemblies Added</p>
            ) : (
              assemblyCodes.map((a) => (
                <li
                  key={a.code}
                  className="flex justify-between items-center p-2.5 border rounded-md bg-gray-50 hover:shadow-md transition duration-200"
                >
                  <span className="text-gray-800">
                    {a.name} ({a.code})
                  </span>
                  <button
                    onClick={() => deleteAssembly(a.code)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:shadow-md transition duration-200"
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
