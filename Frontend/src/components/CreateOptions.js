// src/components/CreateOptions.js
export default function CreateOptions({ setPage }) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-6">Create New</h2>
      <button
        className="btn btn-purple w-full mb-4"
        onClick={() => setPage("projectView")}
      >
        New Folder
      </button>
      <button className="btn btn-yellow w-full mb-4">
        New File
      </button>
      <button
        className="btn btn-gray w-full"
        onClick={() => setPage("dashboard")}
      >
        Cancel
      </button>
    </div>
  );
}
