import { useState } from "react";
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
    <>
      <style>{`
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background: linear-gradient(to right, #e0eafc, #cfdef3);
        }

        .header-wrapper {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: linear-gradient(to right, #e0eafc, #cfdef3);
          border-bottom: 2px solid #2563eb;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
        }

        .header-logo {
          height: 80px;
          object-fit: contain;
        }

        .header-certs {
          height: 60px;
          object-fit: contain;
        }

        .login-section {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem 1rem;
          min-height: calc(100vh - 100px);
        }

        .login-container {
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          border: 2px solid #3b82f6;
          animation: borderPulse 3s infinite ease-in-out;
        }

        @keyframes borderPulse {
          0% {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 10px 4px rgba(59, 130, 246, 0.4);
          }
          100% {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          }
        }

        .login-title {
          text-align: center;
          font-size: 2rem;
          margin-bottom: 1.5rem;
          color: #333;
          font-weight: bold;
        }

        .login-input {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .login-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          outline: none;
        }

        .login-button {
          width: 100%;
          padding: 0.75rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .login-button:hover:not(.disabled) {
          background-color: #2563eb;
          transform: scale(1.02);
        }

        .login-button.disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .error-text {
          color: #ef4444;
          margin-bottom: 1rem;
          font-size: 0.95rem;
          text-align: center;
        }
      `}</style>

      {/* Header with Logo and Certifications */}
      <div className="header-wrapper">
        <div className="header-content">
          <img src={logo} alt="Company Logo" className="header-logo" />
          <img src={certs} alt="Certifications" className="header-certs" />
        </div>
      </div>

      {/* Login Form Section */}
      <div className="login-section">
        <div className="login-container">
          <h2 className="login-title">Login</h2>
          {error && <p className="error-text">{error}</p>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className="login-input"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`login-button ${loading ? "disabled" : ""}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </>
  );
}
