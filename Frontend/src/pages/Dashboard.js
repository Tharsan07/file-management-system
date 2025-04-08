import React, { useState, useEffect } from "react";
import {
  Folder,
  File,
  ChevronLeft,
  PlusCircle,
  UploadCloud,
} from "lucide-react";
import RenameModal from "../components/RenameModal";
import ModelComponent from "../components/ModelComponent";
import Header from "../components/header";

export default function Dashboard({ authToken, setPage }) {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);
  const [sortOption, setSortOption] = useState("name");

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  const logout = () => {
    localStorage.removeItem("authToken");
    setPage("login");
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/folder/list?path=${encodeURIComponent(
          currentPath
        )}`
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

  const addFolder = async (year, companyCode, assemblyCode) => {
    const folderName =
      companyCode && assemblyCode
        ? `${year}-${companyCode}-${assemblyCode}`
        : year;

    try {
      const response = await fetch(
        "http://localhost:5000/api/folder/create-folder",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderName, path: currentPath }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        fetchFiles();
        console.log("Folder created:", data.folderName);
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

  const navigateToFolder = (folderName) => {
    setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
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

  const sortFiles = (files) => {
    switch (sortOption) {
      case "name":
        return files.sort((a, b) => a.name.localeCompare(b.name));
      case "date":
        return files.sort((a, b) => new Date(b.date) - new Date(a.date));
      case "size":
        return files.sort((a, b) => b.size - a.size);
      default:
        return files;
    }
  };

  const filteredFiles = files.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      (item.date && item.date.toLowerCase().includes(query))
    );
  });

  const sortedFiles = sortFiles(filteredFiles);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Header />
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

      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 flex items-center gap-4">
          <input
            type="text"
            placeholder="Search files & folders"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-96 p-3 border border-gray-300 rounded-xl shadow-inner focus:border-gray-500 focus:ring-2 focus:ring-blue-300 outline-none transition-all"
          />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl shadow-inner focus:border-gray-500 focus:ring-2 focus:ring-blue-300 outline-none transition-all"
          >
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>

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
      </div>

      <div className="p-4">
        {currentPath && (
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={goBack}
              className="text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex flex-wrap items-center gap-1 text-sm text-gray-600">
              {currentPath.split("/").map((segment, index) => (
                <div key={index} className="flex items-center gap-1">
                  <span
                    onClick={() => navigateToPathSegment(index)}
                    className="cursor-pointer text-blue-600 hover:underline"
                  >
                    {segment}
                  </span>
                  {index < currentPath.split("/").length - 1 && (
                    <span className="text-gray-400">/</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedFiles.length > 0 ? (
          sortedFiles.map((item) => (
            <div
              key={item.name}
              className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col items-center justify-center border border-gray-100"
            >
              <div
                onClick={() =>
                  item.type === "folder" && navigateToFolder(item.name)
                }
                className="cursor-pointer mb-2"
              >
                {item.type === "folder" ? (
                  <Folder size={40} className="text-blue-500" />
                ) : (
                  <File size={40} className="text-green-500" />
                )}
              </div>
              <span className="text-sm font-medium text-center break-words">
                {item.name}
              </span>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => renameItem(item.name)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs transition-all"
                >
                  Rename
                </button>
                <button
                  onClick={() => deleteItem(item.name)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 italic mt-10">
            No files or folders found in this directory.
          </p>
        )}
      </div>

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
}cd 