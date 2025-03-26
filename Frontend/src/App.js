// src/App.js
import { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import CreateOptions from "./components/CreateOptions";
import ProjectView from "./components/ProjectView";
import AdminPage from "./components/AdminPage"

export default function App() {
  const [page, setPage] = useState("login");
  const [authToken, setAuthToken] = useState(null);

  // On mount, check if token exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
      setPage("dashboard");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
      <div className="card-container w-full max-w-4xl">
        {page === "login" && (
          <LoginPage setPage={setPage} setAuthToken={setAuthToken} />
        )}
        {page === "dashboard" && (
          <Dashboard setPage={setPage} authToken={authToken} />
        )}
        {page === "createOptions" && <CreateOptions setPage={setPage} />}
        {page === "projectView" && (
          <ProjectView setPage={setPage} authToken={authToken} />
        )}
        {page === "admin" && <AdminPage setPage={setPage} />}

      </div>
    </div>
  );
}
