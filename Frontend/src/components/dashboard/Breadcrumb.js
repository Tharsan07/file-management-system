import React from 'react';
import { ChevronLeft } from 'lucide-react';

const Breadcrumb = ({ currentPath, goBack, setCurrentPath, navigateToPathSegment }) => {
  if (!currentPath) return null;

  return (
    <div className="flex items-center gap-2 mb-2 p-3 bg-white rounded-xl shadow-sm">
      <button onClick={goBack} className="text-gray-600 hover:text-gray-800">
        <ChevronLeft size={20} />
      </button>
      <div className="flex flex-wrap items-center gap-1 text-sm text-gray-600">
        <span 
          onClick={() => setCurrentPath("")}
          className="cursor-pointer text-blue-600 hover:underline"
        >
          Home
        </span>
        {currentPath.split("/").map((segment, index) => (
          <div key={index} className="flex items-center gap-1">
            <span className="text-gray-400">/</span>
            <span
              onClick={() => navigateToPathSegment(index)}
              className="cursor-pointer text-blue-600 hover:underline"
            >
              {segment}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumb; 