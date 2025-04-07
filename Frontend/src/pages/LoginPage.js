import React, { useState } from "react";
import logo from "../assets/logo.png"; // Corrected relative path
import certs from "../assets/iso-certify-trans.png"; // Corrected relative path

export default function LoginPage({ setPage, setAuthToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setAuthToken(data.token);
        sessionStorage.setItem("authToken", data.token);
        setPage("dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center p-4">
          <img src={logo} alt="Company Logo" className="h-16 object-contain" />
          <img src={certs} alt="Certifications" className="h-12 object-contain" />
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="bg-white p-8 rounded-md shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Login</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:border-blue-600 outline-none transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:border-blue-600 outline-none transition-all"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full p-3 rounded-md text-white font-bold ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } transition-all`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}