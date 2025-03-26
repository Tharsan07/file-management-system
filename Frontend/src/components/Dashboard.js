    import { useState, useEffect } from "react";
    import AdminPage from "./AdminPage";

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
      console.log(response.body);
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
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search files & folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field mb-4 w-full p-2 border border-gray-300 rounded"
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
            <button className="link-btn mt-6" onClick={goToAdminPage}>
              Go to Admin Page
            </button>
          </div>

          {/* File Upload Input */}
          <div className="mb-4">
            <input type="file" onChange={uploadFile} className="file-upload" />
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
                  <div className="flex gap-2">
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
      );
    }
