import React, { useState, useEffect } from "react";
import { Folder, File, ChevronLeft, PlusCircle, UploadCloud } from "lucide-react"; // Import Shadcn UI icons
import RenameModal from "./RenameModal"; // Import the RenameModal component
import ModelComponent from "./ModelComponent";
import Header from "./header";
export default function Dashboard({ authToken, setPage }) {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/list?path=${encodeURIComponent(currentPath)}`
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
    const folderName = `${year}-${companyCode}-${assemblyCode}`;
    const response = await fetch("http://localhost:5000/api/create-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderName, path: currentPath }),
    });
    if (response.ok) {
      fetchFiles();
    } else {
      alert("Folder creation failed.");
    }
  };

  const deleteItem = async (name) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const response = await fetch("http://localhost:5000/api/delete", {
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
    const response = await fetch("http://localhost:5000/api/rename", {
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
    const response = await fetch("http://localhost:5000/api/upload", {
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

  const filteredFiles = files.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <Header/>
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-lg font-bold">File Manager</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium">Welcome, User</span>
            <button
              onClick={goToAdminPage}
              className="bg-green-600 text-white px-4 py-2 rounded-md"
            >
              Admin
            </button>
            <button
              onClick={() => setPage("logout")}
              className="bg-red-600 text-white px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-5 flex flex-col md:flex-row justify-between items-center">
        <input
          type="text"
          placeholder="Search files & folders"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-auto p-2 mb-4 md:mb-0 border border-gray-300 rounded-md focus:border-gray-400 outline-none"
        />
        <div className="flex gap-4 mt-4 md:mt-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
          >
            <PlusCircle size={16} /> Add Folder
          </button>
          <label
            htmlFor="file-upload"
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-700 transition-all"
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

      {/* Navigation */}
      <div className="p-4">
        {currentPath && (
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={goBack}
              className="text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-gray-600">
              {currentPath.split("/").map((segment, index) => (
                <span key={index}>
                  <span
                    onClick={() => navigateToPathSegment(index)}
                    className="cursor-pointer hover:text-blue-600"
                  >
                    {segment}
                  </span>
                  {index < currentPath.split("/").length - 1 && "/"}
                </span>
              ))}
            </span>
          </div>
        )}
      </div>

      {/* Files and Folders */}
      <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.length > 0 ? (
          filteredFiles.map((item) => (
            <div
              key={item.name}
              className="bg-white p-4 rounded-md shadow-sm flex flex-col items-center justify-center"
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
              <span className="text-sm font-medium">{item.name}</span>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => renameItem(item.name)}
                  className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs"
                >
                  Rename
                </button>
                <button
                  onClick={() => deleteItem(item.name)}
                  className="bg-red-600 text-white px-2 py-1 rounded-md text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">No items found</p>
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