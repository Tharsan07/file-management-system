const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cors = require("cors");
const mysql = require("mysql2/promise");
const authRoutes = require("./routes/auth");
require("dotenv").config();

const app = express();
const PORT = 5000;
const STORAGE_PATH = process.env.STORAGE_PATH || path.join(__dirname, "upload");

app.use(express.json());
app.use(cors()); // Allow frontend requests
app.use("/api/auth", authRoutes);

// Global variable to hold the current folder path.
// This should be updated as the user navigates or creates folders.
let folder_path = "";

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_PATH)) {
  fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// List all files and folders in a specific directory
app.get("/api/list", (req, res) => {
  const requestedPath = req.query.path || "";
  folder_path = requestedPath; // Update global folder_path when navigating
  const fullPath = path.join(STORAGE_PATH, requestedPath);

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ message: "Directory not found." });
  }

  try {
    const items = fs.readdirSync(fullPath).map((name) => ({
      name,
      type: fs.statSync(path.join(fullPath, name)).isDirectory() ? "folder" : "file",
    }));
    res.json(items);
  } catch (error) {
    console.error("Error reading directory:", error);
    res.status(500).json({ message: "Error reading directory.", error: error.toString() });
  }
});

// Create folder endpoint
app.post("/api/create-folder", (req, res) => {
  const { folderName, path: currentPath } = req.body;
  if (!folderName) {
    return res.status(400).json({ message: "Folder name is required!" });
  }

  // Construct full path based on the current path and the new folder name
  const fullPath = path.join(STORAGE_PATH, currentPath || "", folderName);
  // Update the global folder_path to the currentPath (or empty if at root)
  folder_path = currentPath || "";
  console.log("Creating folder in path:", currentPath);

  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      // If the folder is created at the root level, create default "2D" and "3D" subfolders.
      if (!currentPath) {
        fs.mkdirSync(path.join(fullPath, "2D"));
        fs.mkdirSync(path.join(fullPath, "3D"));
      }
      return res.json({ message: "Folder created successfully!", folderName });
    }
    res.status(400).json({ message: "Folder already exists!" });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Error creating folder.", error: error.toString() });
  }
});

// Rename a file or folder
app.post("/api/rename", (req, res) => {
  const { oldName, newName, path: itemPath = "" } = req.body;
  const oldPath = path.join(STORAGE_PATH, itemPath, oldName);
  const newPath = path.join(STORAGE_PATH, itemPath, newName);

  try {
    if (!fs.existsSync(oldPath)) {
      return res.status(400).json({ message: "Item not found." });
    }
    fs.renameSync(oldPath, newPath);
    res.json({ message: "Renamed successfully!" });
  } catch (error) {
    console.error("Error renaming item:", error);
    res.status(500).json({ message: "Error renaming item.", error: error.toString() });
  }
});

// Delete a file or folder
app.post("/api/delete", (req, res) => {
  const { name, path: itemPath = "" } = req.body;
  const fullPath = path.join(STORAGE_PATH, itemPath, name);

  try {
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      return res.json({ message: "Deleted successfully!" });
    }
    res.status(400).json({ message: "Item not found!" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Error deleting item.", error: error.toString() });
  }
});

// Multer storage configuration for file uploads.
// It uses the global folder_path variable as the destination.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("In storage, using global folder_path:", folder_path);
    const uploadPath = path.join(STORAGE_PATH, folder_path || "");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Upload endpoint using single file upload
app.post("/api/upload", upload.single("file"), (req, res) => {
  console.log("Received form data on upload endpoint:", req.body);
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  res.json({
    message: "File uploaded successfully!",
    fileName: req.file.originalname,
    currentPath: folder_path || ""
  });
});

// Admin API - Add Company
app.post("/api/add-company", async (req, res) => {
  const { code, name } = req.body;
  if (!code || !name)
    return res.status(400).json({ message: "Code and name are required!" });

  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(
      "SELECT * FROM companies WHERE code = ?",
      [code]
    );
    if (results.length > 0) {
      return res.status(400).json({ message: "Company code already exists!" });
    }

    await connection.execute(
      "INSERT INTO companies (code, name) VALUES (?, ?)",
      [code, name]
    );
    res.json({ message: "Company added successfully!" });
  } catch (error) {
    console.error("Error adding company:", error);
    res.status(500).json({ message: "Error adding company.", error: error.toString() });
  } finally {
    connection.release();
  }
});

// Admin API - Add Assembly
app.post("/api/add-assembly", async (req, res) => {
  const { code, name } = req.body;
  if (!code || !name)
    return res.status(400).json({ message: "Code and name are required!" });

  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(
      "SELECT * FROM assemblies WHERE code = ?",
      [code]
    );
    if (results.length > 0) {
      return res.status(400).json({ message: "Assembly code already exists!" });
    }

    await connection.execute(
      "INSERT INTO assemblies (code, name) VALUES (?, ?)",
      [code, name]
    );
    res.json({ message: "Assembly added successfully!" });
  } catch (error) {
    console.error("Error adding assembly:", error);
    res.status(500).json({ message: "Error adding assembly.", error: error.toString() });
  } finally {
    connection.release();
  }
});

// Get all company and assembly codes
app.get("/api/get-metadata", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [companies] = await connection.execute("SELECT * FROM companies");
    const [assemblies] = await connection.execute("SELECT * FROM assemblies");
    res.json({ companies, assemblies });
  } catch (error) {
    console.error("Error fetching metadata:", error);
    res.status(500).json({ message: "Error fetching metadata.", error: error.toString() });
  } finally {
    connection.release();
  }
});

// API to get all company codes and their count
app.get("/api/company-codes", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [companies] = await connection.execute("SELECT code FROM companies");
    const companyCodes = companies.map((company) => company.code);
    res.json({ total: companyCodes.length, codes: companyCodes });
  } catch (error) {
    console.error("Error fetching company codes:", error);
    res.status(500).json({ message: "Error fetching company codes.", error: error.toString() });
  } finally {
    connection.release();
  }
});

app.get("/api/assembly-codes", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [assemblies] = await connection.execute("SELECT code FROM assemblies");
    const assemblyCodes = assemblies.map((assembly) => assembly.code);
    res.json({ total: assemblyCodes.length, codes: assemblyCodes });
  } catch (error) {
    console.error("Error fetching assembly codes:", error);
    res.status(500).json({ message: "Error fetching assembly codes.", error: error.toString() });
  } finally {
    connection.release();
  }
});

// Add these endpoints to your existing server code

// Delete a company by code
app.post("/api/delete-company", async (req, res) => {
  const { code } = req.body;
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      "DELETE FROM companies WHERE code = ?",
      [code]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Company not found!" });
    }
    res.json({ message: "Company deleted successfully!" });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({ message: "Error deleting company.", error: error.toString() });
  } finally {
    connection.release();
  }
});

// Delete an assembly by code
app.post("/api/delete-assembly", async (req, res) => {
  const { code } = req.body;
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      "DELETE FROM assemblies WHERE code = ?",
      [code]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Assembly not found!" });
    }
    res.json({ message: "Assembly deleted successfully!" });
  } catch (error) {
    console.error("Error deleting assembly:", error);
    res.status(500).json({ message: "Error deleting assembly.", error: error.toString() });
  } finally {
    connection.release();
  }
});


app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);
