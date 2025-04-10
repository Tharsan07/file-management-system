// src/App.js
import React, { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/LoginPage";
import CreateOptions from "./components/CreateOptions";
import ProjectView from "./components/ProjectView";
import AdminPage from "./pages/AdminPage";

function App() {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("authToken"));
  const [page, setPage] = useState(() => {
    const savedPage = localStorage.getItem("currentPage");
    return authToken ? savedPage || "dashboard" : "login";
  });

  // Save authToken to localStorage and redirect to dashboard on login
  useEffect(() => {
    if (authToken) {
      localStorage.setItem("authToken", authToken);
      // Don't overwrite page if it's already set (e.g., "admin")
      if (!localStorage.getItem("currentPage")) {
        setPage("dashboard");
      }
    } else {
      localStorage.removeItem("authToken");
      setPage("login");
    }
  }, [authToken]);

  // Sync current page to localStorage
  useEffect(() => {
    if (page) {
      localStorage.setItem("currentPage", page);
    }
  }, [page]);

  return (
    <div>
      {page === "login" && (
        <Login setAuthToken={setAuthToken} setPage={setPage} />
      )}
      {page === "dashboard" && (
        <Dashboard authToken={authToken} setPage={setPage} />
      )}
      {page === "createOptions" && (
        <CreateOptions setPage={setPage} />
      )}
      {page === "projectView" && (
        <ProjectView setPage={setPage} authToken={authToken} />
      )}
      {page === "admin" && (
        <AdminPage setPage={setPage} />
      )}
    </div>
  );
}

export default App;
