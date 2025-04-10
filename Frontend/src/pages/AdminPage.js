import React, { useState, useEffect } from "react";
import { Trash2, PlusCircle, Pencil } from "lucide-react";
import Header from "../components/header";

export default function AdminPage({ setPage }) {
  const [companies, setCompanies] = useState([]);
  const [assemblyCodes, setAssemblyCodes] = useState([]);

  const [companyName, setCompanyName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [assemblyName, setAssemblyName] = useState("");
  const [assemblyCode, setAssemblyCode] = useState("");

  const [editingCompany, setEditingCompany] = useState(null);
  const [editingAssembly, setEditingAssembly] = useState(null);

  useEffect(() => {
    fetchCompanies();
    fetchAssemblyCodes();
    localStorage.setItem("currentPage", "admin");
  }, []);

  useEffect(() => {
    const savedPage = localStorage.getItem("currentPage");
    if (savedPage === "admin") {
      setPage("admin");
    }
  }, [setPage]);

  const fetchCompanies = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/company-codes");
      const data = await res.json();
      setCompanies(data.codes || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  const fetchAssemblyCodes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/assembly-codes");
      const data = await res.json();
      setAssemblyCodes(data.codes || []);
    } catch (err) {
      console.error("Error fetching assemblies:", err);
    }
  };

  const addCompany = async () => {
    if (!companyName || !companyCode) return alert("Enter both fields");
    const res = await fetch("http://localhost:5000/api/admin/add-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: companyName, code: companyCode }),
    });
    if (res.ok) {
      fetchCompanies();
      setCompanyName("");
      setCompanyCode("");
    } else alert("Failed to add company");
  };

  const addAssembly = async () => {
    if (!assemblyName || !assemblyCode) return alert("Enter both fields");
    const res = await fetch("http://localhost:5000/api/admin/add-assembly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: assemblyName, code: assemblyCode }),
    });
    if (res.ok) {
      fetchAssemblyCodes();
      setAssemblyName("");
      setAssemblyCode("");
    } else alert("Failed to add assembly");
  };

  const deleteCompany = async (code) => {
    if (!window.confirm("Are you sure?")) return;
    const res = await fetch("http://localhost:5000/api/admin/delete-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) fetchCompanies();
    else alert("Failed to delete company");
  };

  const deleteAssembly = async (code) => {
    if (!window.confirm("Are you sure?")) return;
    const res = await fetch("http://localhost:5000/api/admin/delete-assembly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) fetchAssemblyCodes();
    else alert("Failed to delete assembly");
  };

  const editCompany = async () => {
    const { oldCode, name, code } = editingCompany;
    const res = await fetch("http://localhost:5000/api/admin/edit-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldCode, newName: name, newCode: code }),
    });
    if (res.ok) {
      fetchCompanies();
      setEditingCompany(null);
    } else alert("Failed to update company");
  };

  const editAssembly = async () => {
    const { oldCode, name, code } = editingAssembly;
    const res = await fetch("http://localhost:5000/api/admin/edit-assembly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldCode, newName: name, newCode: code }),
    });
    if (res.ok) {
      fetchAssemblyCodes();
      setEditingAssembly(null);
    } else alert("Failed to update assembly");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      <div className="p-4 flex justify-between items-center bg-white border-b border-gray-200 shadow">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <button
          onClick={() => {
            localStorage.setItem("currentPage", "dashboard");
            setPage("dashboard");
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Manage Companies</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl"
            />
            <input
              type="text"
              placeholder="Company Code"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl"
            />
            <button
              onClick={addCompany}
              className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
            >
              <PlusCircle size={16} className="inline-block mr-1" /> Add
            </button>
          </div>
          <ul className="space-y-2">
            {companies.map((c) => (
              <li
                key={c.code}
                className="flex justify-between items-center p-3 border border-gray-200 rounded-xl bg-gray-50"
              >
                {editingCompany?.oldCode === c.code ? (
                  <div className="flex gap-2 w-full">
                    <input
                      value={editingCompany.name}
                      onChange={(e) =>
                        setEditingCompany({ ...editingCompany, name: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      value={editingCompany.code}
                      onChange={(e) =>
                        setEditingCompany({ ...editingCompany, code: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <button onClick={editCompany} className="bg-blue-500 text-white px-3 rounded-lg">
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{c.name} ({c.code})</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingCompany({ oldCode: c.code, name: c.name, code: c.code })}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => deleteCompany(c.code)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Manage Assemblies</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Assembly Name"
              value={assemblyName}
              onChange={(e) => setAssemblyName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl"
            />
            <input
              type="text"
              placeholder="Assembly Code"
              value={assemblyCode}
              onChange={(e) => setAssemblyCode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl"
            />
            <button
              onClick={addAssembly}
              className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
            >
              <PlusCircle size={16} className="inline-block mr-1" /> Add
            </button>
          </div>
          <ul className="space-y-2">
            {assemblyCodes.map((a) => (
              <li
                key={a.code}
                className="flex justify-between items-center p-3 border border-gray-200 rounded-xl bg-gray-50"
              >
                {editingAssembly?.oldCode === a.code ? (
                  <div className="flex gap-2 w-full">
                    <input
                      value={editingAssembly.name}
                      onChange={(e) =>
                        setEditingAssembly({ ...editingAssembly, name: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      value={editingAssembly.code}
                      onChange={(e) =>
                        setEditingAssembly({ ...editingAssembly, code: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <button onClick={editAssembly} className="bg-blue-500 text-white px-3 rounded-lg">
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{a.name} ({a.code})</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingAssembly({ oldCode: a.code, name: a.name, code: a.code })}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => deleteAssembly(a.code)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
