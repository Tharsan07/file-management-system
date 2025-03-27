import { useState, useEffect } from "react";
import Header from "./header";

export default function AdminPage({ setPage }) {
  const [companies, setCompanies] = useState([]);
  const [assemblyCodes, setAssemblyCodes] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [assemblyName, setAssemblyName] = useState("");
  const [assemblyCode, setAssemblyCode] = useState("");

  useEffect(() => {
    fetchCompanies();
    fetchAssemblyCodes();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/company-codes");
      const data = await response.json();
      setCompanies(data.codes || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  const fetchAssemblyCodes = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/assembly-codes");
      const data = await response.json();
      setAssemblyCodes(data.codes || []);
    } catch (err) {
      console.error("Error fetching assembly codes:", err);
    }
  };

  const addCompany = async () => {
    if (!companyName || !companyCode) return alert("Enter both fields");
    const response = await fetch("http://localhost:5000/api/add-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: companyName, code: companyCode }),
    });

    if (response.ok) {
      fetchCompanies();
      setCompanyName("");
      setCompanyCode("");
    } else {
      alert("Failed to add company");
    }
  };

  const addAssembly = async () => {
    if (!assemblyName || !assemblyCode) return alert("Enter both fields");
    const response = await fetch("http://localhost:5000/api/add-assembly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: assemblyName, code: assemblyCode }),
    });

    if (response.ok) {
      fetchAssemblyCodes();
      setAssemblyName("");
      setAssemblyCode("");
    } else {
      alert("Failed to add assembly");
    }
  };

  const deleteCompany = async (code) => {
    if (!window.confirm("Are you sure?")) return;
    const response = await fetch("http://localhost:5000/api/delete-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (response.ok) {
      fetchCompanies();
    } else {
      alert("Failed to delete company");
    }
  };

  const deleteAssembly = async (code) => {
    if (!window.confirm("Are you sure?")) return;
    const response = await fetch("http://localhost:5000/api/delete-assembly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (response.ok) {
      fetchAssemblyCodes();
    } else {
      alert("Failed to delete assembly");
    }
  };

  return (
    <div className="AdminPage" style={styles.gradientWrapper}>
      <Header />
      <header style={styles.header}>
        <h1 style={styles.heading}>Admin Panel</h1>
        <button onClick={() => setPage("dashboard")} style={styles.backButton}>
          ← Back to Dashboard
        </button>
      </header>

      <div style={styles.containerWrapper}>
        {/* Company Management */}
        <div style={styles.card}>
          <h3 style={styles.subheading}>Manage Companies</h3>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Company Code"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              style={styles.input}
            />
            <button onClick={addCompany} style={styles.addButton}>
              Add
            </button>
          </div>
          <ul style={styles.list}>
            {companies.length === 0 ? (
              <p style={styles.noItems}>No Companies Added</p>
            ) : (
              companies.map((c) => (
                <li key={c.code} style={styles.listItem}>
                  <span style={styles.itemText}>
                    {c.name} ({c.code})
                  </span>
                  <button
                    onClick={() => deleteCompany(c.code)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Assembly Management */}
        <div style={styles.card}>
          <h3 style={styles.subheading}>Manage Assemblies</h3>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Assembly Name"
              value={assemblyName}
              onChange={(e) => setAssemblyName(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Assembly Code"
              value={assemblyCode}
              onChange={(e) => setAssemblyCode(e.target.value)}
              style={styles.input}
            />
            <button onClick={addAssembly} style={styles.addButton}>
              Add
            </button>
          </div>
          <ul style={styles.list}>
            {assemblyCodes.length === 0 ? (
              <p style={styles.noItems}>No Assemblies Added</p>
            ) : (
              assemblyCodes.map((a) => (
                <li key={a.code} style={styles.listItem}>
                  <span style={styles.itemText}>
                    {a.name} ({a.code})
                  </span>
                  <button
                    onClick={() => deleteAssembly(a.code)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// 🎨 Styles
const styles = {
  gradientWrapper: {
    minHeight: "100vh",
    padding: "20px",
    background: "linear-gradient(135deg, #f0f4f8, #e0e7ff)",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  heading: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10px",
  },
  backButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "1px solid #007bff",
    padding: "8px 16px",
    fontSize: "14px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  containerWrapper: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
  },
  card: {
    flex: "1 1 400px",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
  },
  subheading: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#444",
    marginBottom: "16px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "8px",
  },
  inputGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "16px",
  },
  input: {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    minWidth: "180px",
    flex: "1",
  },
  addButton: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },
  list: {
    listStyle: "none",
    padding: "0",
    marginTop: "10px",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    border: "1px solid #eee",
    borderRadius: "6px",
    marginBottom: "8px",
    backgroundColor: "#fafafa",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  itemText: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
  },
  deleteButton: {
    padding: "6px 12px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    transition: "all 0.2s ease",
  },
  noItems: {
    color: "#666",
    fontSize: "16px",
  },
};

// Hover Effects
const hoverStyles = `
  .AdminPage button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }
  .AdminPage .listItem:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  .AdminPage input:focus {
    border-color: #007bff;
    outline: none;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = hoverStyles;
  document.head.appendChild(styleSheet);
}
