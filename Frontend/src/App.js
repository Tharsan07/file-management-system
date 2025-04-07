// src/App.js
import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import CreateOptions from "./components/CreateOptions";
import ProjectView from "./components/ProjectView";
import AdminPage from "./pages/AdminPage"

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
    <div >
      <div >
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
