import React from 'react';

const FileOpenDialog = ({ isOpen, onClose, fileName, onOpenWith }) => {
  if (!isOpen) return null;

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  const getRelevantApps = (filename) => {
    const extension = getFileExtension(filename);
    
    // Common applications for different file types
    const appMap = {
      // CAD and Engineering files
      'dwg': [
        { name: 'Default Application', icon: '📄' },
        { name: 'AutoCAD', icon: '📐' },
        { name: 'DraftSight', icon: '📐' },
        { name: 'BricsCAD', icon: '📐' },
        { name: 'LibreCAD', icon: '📐' }
      ],
      'dxf': [
        { name: 'Default Application', icon: '📄' },
        { name: 'AutoCAD', icon: '📐' },
        { name: 'DraftSight', icon: '📐' },
        { name: 'BricsCAD', icon: '📐' },
        { name: 'LibreCAD', icon: '📐' }
      ],
      // Hydraulic and Engineering files
      'hcf': [
        { name: 'Default Application', icon: '📄' },
        { name: 'HydraCAD', icon: '💧' },
        { name: 'AutoCAD MEP', icon: '🏗️' },
        { name: 'Revit MEP', icon: '🏗️' }
      ],
      'hds': [
        { name: 'Default Application', icon: '📄' },
        { name: 'HydraCAD', icon: '💧' },
        { name: 'AutoCAD MEP', icon: '🏗️' },
        { name: 'Revit MEP', icon: '🏗️' }
      ],
      // Text files
      'txt': [
        { name: 'Default Application', icon: '📄' },
        { name: 'Notepad', icon: '📝' },
        { name: 'Microsoft Word', icon: '📘' },
        { name: 'Visual Studio Code', icon: '💻' }
      ],
      // Word documents
      'doc': [
        { name: 'Default Application', icon: '📄' },
        { name: 'Microsoft Word', icon: '📘' },
        { name: 'LibreOffice Writer', icon: '📝' }
      ],
      'docx': [
        { name: 'Default Application', icon: '📄' },
        { name: 'Microsoft Word', icon: '📘' },
        { name: 'LibreOffice Writer', icon: '📝' }
      ],
      // PDF files
      'pdf': [
        { name: 'Default Application', icon: '📄' },
        { name: 'Adobe Acrobat', icon: '📑' },
        { name: 'Chrome', icon: '🌐' },
        { name: 'Microsoft Edge', icon: '🌐' }
      ],
      // Images
      'jpg': [
        { name: 'Default Application', icon: '📄' },
        { name: 'Photos', icon: '🖼️' },
        { name: 'Paint', icon: '🎨' },
        { name: 'Chrome', icon: '🌐' }
      ],
      'jpeg': [
        { name: 'Default Application', icon: '📄' },
        { name: 'Photos', icon: '🖼️' },
        { name: 'Paint', icon: '🎨' },
        { name: 'Chrome', icon: '🌐' }
      ],
      'png': [
        { name: 'Default Application', icon: '📄' },
        { name: 'Photos', icon: '🖼️' },
        { name: 'Paint', icon: '🎨' },
        { name: 'Chrome', icon: '🌐' }
      ],
      // Audio files
      'mp3': [
        { name: 'Default Application', icon: '📄' },
        { name: 'Windows Media Player', icon: '🎵' },
        { name: 'Groove Music', icon: '🎵' },
        { name: 'VLC Media Player', icon: '🎵' }
      ],
      'wav': [
        { name: 'Default Application', icon: '📄' },
        { name: 'Windows Media Player', icon: '🎵' },
        { name: 'Groove Music', icon: '🎵' },
        { name: 'VLC Media Player', icon: '🎵' }
      ],
      // Video files
      'mp4': [
        { name: 'Default Application', icon: '📄' },
        { name: 'Windows Media Player', icon: '🎬' },
        { name: 'Movies & TV', icon: '🎬' },
        { name: 'VLC Media Player', icon: '🎬' }
      ],
      'avi': [
        { name: 'Default Application', icon: '📄' },
        { name: 'Windows Media Player', icon: '🎬' },
        { name: 'Movies & TV', icon: '🎬' },
        { name: 'VLC Media Player', icon: '🎬' }
      ],
      // Code files
      'js': [
        { name: 'Default Application', icon: '📄' },
        { name: 'Visual Studio Code', icon: '💻' },
        { name: 'Notepad++', icon: '📝' },
        { name: 'Sublime Text', icon: '📝' }
      ],
      'html': [
        { name: 'Default Application', icon: '📄' },
        { name: 'Visual Studio Code', icon: '💻' },
        { name: 'Chrome', icon: '🌐' },
        { name: 'Notepad++', icon: '📝' }
      ],
      'css': [
        { name: 'Default Application', icon: '📄' },
        { name: 'Visual Studio Code', icon: '💻' },
        { name: 'Notepad++', icon: '📝' },
        { name: 'Sublime Text', icon: '📝' }
      ]
    };

    // Return apps for the specific file type, or default apps if type not found
    return appMap[extension] || [
      { name: 'Default Application', icon: '📄' },
      { name: 'Notepad', icon: '📝' },
      { name: 'Chrome', icon: '🌐' }
    ];
  };

  const relevantApps = getRelevantApps(fileName);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Open with</h2>
        <p className="text-gray-600 mb-4">Choose an application to open "{fileName}"</p>
        
        <div className="space-y-2">
          {relevantApps.map((app) => (
            <button
              key={app.name}
              onClick={() => onOpenWith(app.name)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-2xl">{app.icon}</span>
              <span>{app.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileOpenDialog; 