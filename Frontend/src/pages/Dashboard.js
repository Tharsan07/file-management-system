import React, { useState, useEffect } from "react";
import Header from "../components/header";
import RenameModal from "../components/RenameModal";
import ModelComponent from "../components/ModelComponent";
import SearchAndFilters from "../components/dashboard/SearchAndFilters.js";
import FileGrid from "../components/dashboard/FileGrid.js";
import Breadcrumb from "../components/dashboard/Breadcrumb.js";
import ActionButtons from "../components/dashboard/ActionButtons.js";

export default function Dashboard({ authToken, setPage }) {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);
  const [yearFilter, setYearFilter] = useState("");
  const [companyCodeFilter, setCompanyCodeFilter] = useState("");
  const [assemblyCodeFilter, setAssemblyCodeFilter] = useState("");
  const [companies, setCompanies] = useState([]);
  const [assemblyCodes, setAssemblyCodes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedPath = localStorage.getItem("currentPath");
    if (storedPath) {
      setCurrentPath(storedPath);
    } else {
      fetchFiles();
    }
    fetchCompanies();
    fetchAssemblyCodes();
  }, []);

  // Persist currentPath and refetch files when it changes
  useEffect(() => {
    if (currentPath !== undefined) {
      localStorage.setItem("currentPath", currentPath);
      fetchFiles();
    }
  }, [currentPath]);

  // Handle search and filters together
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() || yearFilter || companyCodeFilter || assemblyCodeFilter) {
        handleSearch();
      } else {
        setSearchResults([]);
        fetchFiles();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, yearFilter, companyCodeFilter, assemblyCodeFilter]);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentPath");
    setPage("login");
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/folder/list?path=${encodeURIComponent(currentPath)}`
      );
      const data = await response.json();
      if (response.ok) {
        setFiles(data);
      } else {
        setError("Failed to load files.");
      }
    } catch (err) {
      setError("Error fetching files.");
    }
  };

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

  const addFolder = async (year, companyCode, assemblyCode) => {
    const folderName =
      companyCode && assemblyCode
        ? `${year}-${companyCode}-${assemblyCode}`
        : year;

    try {
      const response = await fetch("http://localhost:5000/api/folder/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName, path: currentPath }),
      });

      if (response.ok) {
        await fetchFiles();
      } else {
        const data = await response.json();
        alert(`Folder creation failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error during folder creation:", error);
      alert("An unexpected error occurred while creating the folder.");
    }
  };

  const deleteItem = async (name) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const response = await fetch("http://localhost:5000/api/folder/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, path: currentPath }),
      });

      if (response.ok) {
        fetchFiles();
      } else {
        alert("Failed to delete item.");
      }
    }
  };

  const renameItem = (oldName) => {
    setItemToRename(oldName);
    setIsRenameModalOpen(true);
  };

  const handleRename = async (oldName, newName) => {
    const response = await fetch("http://localhost:5000/api/folder/rename", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldName, newName, path: currentPath }),
    });

    if (response.ok) {
      fetchFiles();
    } else {
      alert("Failed to rename.");
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/folder/search?query=${encodeURIComponent(searchQuery)}&year=${yearFilter}&companyCode=${companyCodeFilter}&assemblyCode=${assemblyCodeFilter}`
      );
      const data = await response.json();
      if (response.ok) {
        setSearchResults(data);
      } else {
        setError(data.message || "Error searching files");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching files:", error);
      setError("Error searching files");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle search and filters together
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() || yearFilter || companyCodeFilter || assemblyCodeFilter) {
        handleSearch();
      } else {
        setSearchResults([]);
        fetchFiles();
      }
    }, 300);
  
    return () => clearTimeout(timer);
  }, [searchQuery, yearFilter, companyCodeFilter, assemblyCodeFilter]);
  

  const uploadFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", currentPath);

    const response = await fetch("http://localhost:5000/api/folder/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      fetchFiles();
      alert("File uploaded successfully!");
    } else {
      alert("File upload failed.");
    }
  };

  const navigateToFolder = (folderPath) => {
  if (searchQuery.trim() || yearFilter || companyCodeFilter || assemblyCodeFilter) {
    // Clear filters/search when navigating inside folders
    setSearchQuery("");
    setYearFilter("");
    setCompanyCodeFilter("");
    setAssemblyCodeFilter("");
    setSearchResults([]);
    setCurrentPath(currentPath ? `${currentPath}/${folderPath}` : folderPath);
  } else {
    setCurrentPath(currentPath ? `${currentPath}/${folderPath}` : folderPath);
  }
};

  const goBack = () => {
    if (!currentPath) return;
    const pathArray = currentPath.split("/");
    pathArray.pop();
    setCurrentPath(pathArray.join("/"));
  };

  const goToAdminPage = () => {
    setPage("admin");
  };

  const navigateToPathSegment = (index) => {
    const pathArray = currentPath.split("/");
    const newPath = pathArray.slice(0, index + 1).join("/");
    setCurrentPath(newPath);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Header />

      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-lg font-bold">File Manager</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium">Welcome, User</span>
            <button
              onClick={goToAdminPage}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-md transition-all"
            >
              Admin
            </button>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-md transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-wrap">
        <SearchAndFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          companyCodeFilter={companyCodeFilter}
          setCompanyCodeFilter={setCompanyCodeFilter}
          assemblyCodeFilter={assemblyCodeFilter}
          setAssemblyCodeFilter={setAssemblyCodeFilter}
          companies={companies}
          assemblyCodes={assemblyCodes}
          isSearching={isSearching}
          years={years}
        />
        <ActionButtons setIsModalOpen={setIsModalOpen} uploadFile={uploadFile} />
      </div>

      {/* Path Breadcrumb */}
      <div className="px-4 mb-4">
        <Breadcrumb
          currentPath={currentPath}
          goBack={goBack}
          setCurrentPath={setCurrentPath}
          navigateToPathSegment={navigateToPathSegment}
        />
      </div>

      {/* Search Results or Current Directory */}
      <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(searchQuery.trim() || yearFilter || companyCodeFilter || assemblyCodeFilter) ? (
          <FileGrid
            items={searchResults}
            isSearching={isSearching}
            navigateToFolder={navigateToFolder}
            renameItem={renameItem}
            deleteItem={deleteItem}
            isSearchResults={true}
          />
        ) : (
          <FileGrid
            items={files}
            isSearching={isSearching}
            navigateToFolder={navigateToFolder}
            renameItem={renameItem}
            deleteItem={deleteItem}
          />
        )}
      </div>

      {/* Modals */}
      <ModelComponent
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={addFolder}
      />
      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={handleRename}
        oldName={itemToRename}
      />
    </div>
  );
}
