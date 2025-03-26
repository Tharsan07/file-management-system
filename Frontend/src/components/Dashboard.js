import { useState, useEffect } from "react";
import AdminPage from "./AdminPage";
import logo from "../assets/logo.png"; // Corrected relative path
import certs from "../assets/iso-certify-trans.png"; // Corrected relative path

export default function Dashboard({ authToken, setPage }) {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState(""); // Track navigation inside folders
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Search state

  useEffect(() => {
    fetchFiles();
  }, [currentPath]); // Reload when path changes

  // Fetch files and folders from backend
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

  // Create new folder inside the current directory
  const addFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
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
    }
  };

  // Delete a file or folder
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

  // Rename a file or folder
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

  // Upload file to the current folder
  const uploadFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", currentPath); // Use currentPath instead of testPath

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

  // Navigate inside a folder
  const navigateToFolder = (folderName) => {
    setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
  };

  // Go back to the previous folder
  const goBack = () => {
    if (!currentPath) return;
    const pathArray = currentPath.split("/");
    pathArray.pop();
    setCurrentPath(pathArray.join("/"));
  };

  // Navigate to admin page
  const goToAdminPage = () => {
    setPage("admin");
  };

  // Filter files and folders based on search query
  const filteredFiles = files.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <style>{`
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background: linear-gradient(to right, #e0eafc, #cfdef3);
        }

        .header-wrapper {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: linear-gradient(to right, #e0eafc, #cfdef3);
          border-bottom: 2px solid #2563eb;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
        }

        .header-logo {
          height: 80px;
          object-fit: contain;
        }

        .header-certs {
          height: 60px;
          object-fit: contain;
        }

        .dashboard-section {
          padding: 2rem 1rem;
          min-height: calc(100vh - 100px);
        }

        .dashboard-container {
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          border: 2px solid #3b82f6;
          animation: fadeIn 1s ease-in-out, borderPulse 3s infinite ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes borderPulse {
          0% {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 10px 4px rgba(59, 130, 246, 0.4);
          }
          100% {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          }
        }

        .dashboard-title {
          text-align: center;
          font-size: 2rem;
          margin-bottom: 1.5rem;
          color: #333;
          font-weight: bold;
        }

        .input-field {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .input-field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          outline: none;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .btn:hover:not(.disabled) {
          background-color: #2563eb;
          transform: scale(1.05);
        }

        .btn.disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .btn-gray {
          background-color: #6b7280;
        }

        .btn-purple {
          background-color: #7e5bef;
        }

        .btn-blue {
          background-color: #3b82f6;
        }

        .btn-red {
          background-color: #ef4444;
        }

        .btn-small {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .file-card {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .file-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transform: translateY(-5px);
        }

        .file-card span {
          color: black; /* Set folder name color to black */
        }

        .file-card .actions {
          display: flex;
          gap: 0.5rem;
        }

        .file-upload-wrapper {
          position: relative;
          display: inline-block;
          margin-top: 1rem;
        }

        .file-upload-label {
          padding: 0.75rem 1.5rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .file-upload-label:hover {
          background-color: #2563eb;
          transform: scale(1.05);
        }

        .file-upload-input {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
      `}</style>

      {/* Header with Logo and Certifications */}
      <div className="header-wrapper">
        <div className="header-content">
          <img src={logo} alt="Company Logo" className="header-logo" />
          <img src={certs} alt="Certifications" className="header-certs" />
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="dashboard-section">
        <div className="dashboard-container">
          <h2 className="dashboard-title">Dashboard</h2>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search files & folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field mb-4"
          />

          {/* Back Button */}
          {currentPath && (
            <button onClick={goBack} className="btn btn-gray mb-4">
              ⬅ Go Back
            </button>
          )}

          {/* Buttons */}
          <div className="mb-4 flex justify-center gap-4">
            <button onClick={addFolder} className="btn btn-purple">
              Add Folder
            </button>
            <button className="btn btn-blue mt-6" onClick={goToAdminPage}>
              Go to Admin Page
            </button>
          </div>

          {/* File Upload Input */}
          <div className="file-upload-wrapper">
            <label htmlFor="file-upload" className="file-upload-label">
              Choose File
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={uploadFile}
              className="file-upload-input"
            />
          </div>

          {/* Display files and folders */}
          <div className="space-y-4">
            {filteredFiles.length > 0 ? (
              filteredFiles.map((item) => (
                <div key={item.name} className="file-card">
                  <span
                    onClick={() =>
                      item.type === "folder" && navigateToFolder(item.name)
                    }
                    style={{ cursor: item.type === "folder" ? "pointer" : "default" }}
                  >
                    {item.type === "folder" ? "📁" : "📄"} {item.name}
                  </span>
                  <div className="actions">
                    <button
                      onClick={() => renameItem(item.name)}
                      className="btn btn-blue btn-small"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => deleteItem(item.name)}
                      className="btn btn-red btn-small"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No items found</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
