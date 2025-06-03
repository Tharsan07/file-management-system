import React from 'react';
import { Folder, File } from 'lucide-react';

const FileGrid = ({
  items,
  isSearching,
  navigateToFolder,
  renameItem,
  deleteItem,
  isSearchResults = false
}) => {
  const handleFileClick = async (item) => {
    if (item.type === "folder") {
      navigateToFolder(isSearchResults ? item.path : item.name);
    } else {
      try {
        const response = await fetch('http://localhost:5000/api/folder/open-with', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filePath: item.path,
            appName: 'Default Application'
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to open file');
        }
      } catch (error) {
        console.error('Error opening file:', error);
        alert('Failed to open file: ' + error.message);
      }
    }
  };

  if (items.length === 0) {
    return (
      <p className="text-center text-gray-400 italic mt-10 col-span-full">
        {isSearching ? "Searching..." : "No files or folders found matching your criteria."}
      </p>
    );
  }

  return (
    <>
      {items.map((item) => (
        <div
          key={isSearchResults ? item.path : item.name}
          className="bg-white p-6 min-h-[180px] rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center justify-between border border-gray-200"
        >
          <div
            title={`${isSearchResults ? `Path: ${item.path}\n` : ''}Created: ${new Date(item.createdAt).toLocaleString()}`}
            onClick={() => handleFileClick(item)}
            className="cursor-pointer mb-3"
          >
            {item.type === "folder" ? (
              <Folder size={56} className="text-blue-500" />
            ) : (
              <File size={56} className="text-green-500" />
            )}
          </div>
          <div className="text-center">
            <span className="text-base font-semibold break-words">
              {item.name}
            </span>
            {isSearchResults && (
              <p className="text-xs text-gray-500 mt-1 truncate max-w-full">
                {item.path}
              </p>
            )}
          </div>
          <span className="text-xs text-gray-500 mt-2">
            {new Date(item.createdAt).toLocaleString()}
          </span>
          <div className="flex gap-2 mt-3">
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
      ))}
    </>
  );
};

export default FileGrid; 