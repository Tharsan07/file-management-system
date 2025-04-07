import { useState, useEffect } from "react";

export default function ProjectView({ setPage }) {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/folder/list?path=${currentPath}`);
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const addFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    try {
      const response = await fetch("http://localhost:5000/api/folder/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName, path: currentPath }),
      });

      if (response.ok) {
        fetchFiles();
      } else {
        alert("Error: Folder already exists or could not be created.");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const deleteItem = async (name) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await fetch("http://localhost:5000/api/folder/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, path: currentPath }),
      });

      fetchFiles();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const renameItem = async (oldName) => {
    const newName = prompt("Enter new name:");
    if (!newName) return;

    try {
      await fetch("http://localhost:5000/api/folder/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName, newName, path: currentPath }),
      });

      fetchFiles();
    } catch (error) {
      console.error("Error renaming item:", error);
    }
  };

  const uploadFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", currentPath);

    try {
      await fetch("http://localhost:5000/api/folder/upload", {
        method: "POST",
        body: formData,
      });

      fetchFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="project-view-container">
      <h2 className="page-title">2025 &gt; Project 1</h2>

      <div className="action-buttons">
        <button onClick={addFolder} className="btn btn-purple">Add Folder</button>
        <input type="file" onChange={uploadFile} className="file-input" id="file-upload" />
        <label htmlFor="file-upload" className="btn btn-yellow">Upload File</label>
      </div>

      {currentPath && (
        <button onClick={() => setCurrentPath("")} className="btn btn-gray back-button">Back</button>
      )}

      <div className="files-list">
        {files.map((item) => (
          <div key={item.name} className="file-card">
            <span
              onClick={() => item.type === "folder" && setCurrentPath(`${currentPath}/${item.name}`)}
              className="file-name"
            >
              {item.type === "folder" ? "📁" : "📄"} {item.name}
            </span>
            <div className="file-actions">
              <button onClick={() => renameItem(item.name)} className="btn btn-blue btn-small">Rename</button>
              <button onClick={() => deleteItem(item.name)} className="btn btn-red btn-small">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <button className="link-btn" onClick={() => setPage("dashboard")}>Back to Dashboard</button>

      {/* Embedded CSS */}
      <style>{`
        .project-view-container {
          text-align: center;
          padding: 30px;
          background: linear-gradient(135deg, #f0f4f8, #e0e7ff);
          min-height: 100vh;
        }

        .page-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #333;
        }

        .action-buttons {
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .file-input {
          display: none;
        }

        .btn {
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .btn-purple {
          background-color: #6f42c1;
          color: #fff;
        }

        .btn-purple:hover {
          background-color: #5936a1;
        }

        .btn-yellow {
          background-color: #ffc107;
          color: #333;
        }

        .btn-yellow:hover {
          background-color: #e0a800;
        }

        .btn-gray {
          background-color: #6c757d;
          color: #fff;
        }

        .btn-gray:hover {
          background-color: #5a6268;
        }

        .btn-blue {
          background-color: #007bff;
          color: #fff;
        }

        .btn-blue:hover {
          background-color: #0056b3;
        }

        .btn-red {
          background-color: #dc3545;
          color: #fff;
        }

        .btn-red:hover {
          background-color: #bd2130;
        }

        .btn-small {
          padding: 6px 10px;
          font-size: 12px;
        }

        .file-card {
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 12px 16px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          transition: box-shadow 0.2s ease;
        }

        .file-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .file-name {
          cursor: pointer;
          font-weight: 500;
          color: #333;
        }

        .file-actions {
          display: flex;
          gap: 8px;
        }

        .back-button {
          margin-bottom: 20px;
        }

        .link-btn {
          margin-top: 30px;
          background: none;
          color: #007bff;
          border: none;
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
        }

        .link-btn:hover {
          color: #0056b3;
        }
      `}</style>
    </div>
  );
}
