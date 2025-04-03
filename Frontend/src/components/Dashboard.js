import { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import certs from "../assets/iso-certify-trans.png";
import FolderCreationModal from "./ModelComponent";

export default function Dashboard({ authToken, setPage }) {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);
  const navigateToPathSegment = (index) => {
    const pathArray = currentPath.split("/");
    const newPath = pathArray.slice(0, index + 1).join("/");
    setCurrentPath(newPath);
  };
  
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
    const folderName = `${companyCode}-${year}-${assemblyCode}`;
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

  const renameItem = async (oldName) => {
    const newName = prompt("Enter new name:");
    if (newName) {
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

  const filteredFiles = files.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Inline CSS for custom fadeIn and slideIn animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Header with Logo and Certifications */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-100 to-purple-100 border-b-2 border-blue-600 shadow-sm">
        <div className="flex justify-between items-center p-2 px-5">
          <img src={logo} alt="Company Logo" className="h-20 object-contain" />
          <img src={certs} alt="Certifications" className="h-16 object-contain" />
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 animate-[fadeIn_1s_ease-in-out]">
        {/* Sticky Controls Section */}
        <div className="sticky top-[84px] z-10 bg-gradient-to-r from-blue-100 to-purple-100 p-8 pb-4">
          {/* Admin Icon in Top Right */}
          <div className="flex justify-end mb-4">
            <button
              onClick={goToAdminPage}
              className="bg-blue-600 text-white p-2 rounded-full font-bold text-lg hover:bg-blue-700 hover:scale-105 transition-all"
              title="Go to Admin Page"
            >
              👤
            </button>
          </div>

          <h2 className="text-4xl font-bold text-center text-gray-700 mb-6">Dashboard</h2>

          {/* Search Input - Full Width */}
          <input
            type="text"
            placeholder="Search files & folders or paste a path (e.g., /folder1/folder2)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg text-base focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />

          {/* Back Button and Folder Path */}
          {currentPath && (
            <div className="flex items-center gap-4 mb-4 mt-2 animate-[slideIn_0.3s_ease-out]">
              <span
                onClick={goBack}
                className="text-2xl cursor-pointer text-gray-700 hover:text-gray-900"
              >
                ⬅
              </span>
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm">
                <span className="text-gray-700 font-medium">
                  /
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
            </div>
          )}

          {/* Add Folder and Choose File - Aligned Together */}
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold text-base hover:bg-purple-700 hover:scale-105 transition-all"
            >
              Add Folder
            </button>
            <div className="relative inline-block">
              <label
                htmlFor="file-upload"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-base cursor-pointer hover:bg-blue-700 hover:scale-105 transition-all"
              >
                Choose File
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={uploadFile}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Files and Folders Section */}
        <div className="px-12 pt-4 overflow-y-auto max-h-[calc(100vh-300px)]">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((item) => (
              <div
                key={item.name}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center transition-all mb-4"
              >
                <span
                  onClick={() =>
                    item.type === "folder" && navigateToFolder(item.name)
                  }
                  className={item.type === "folder" ? "cursor-pointer text-black" : "text-black"}
                >
                  {item.type === "folder" ? "📁" : "📄"} {item.name}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => renameItem(item.name)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 hover:scale-105 transition-all"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => deleteItem(item.name)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-600 hover:scale-105 transition-all"
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
      </div>

      {/* Folder Creation Modal - Positioned at Root */}
      <FolderCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={addFolder}
      />
    </>
  );
}
