const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = express.Router();

const STORAGE_PATH = process.env.STORAGE_PATH || path.join(__dirname, "..", "upload");
let folder_path = "";

// Ensure storage path exists
if (!fs.existsSync(STORAGE_PATH)) {
  fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

// List files/folders
router.get("/list", (req, res) => {
  const requestedPath = req.query.path || "";
  folder_path = requestedPath;
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
    res.status(500).json({ message: "Error reading directory.", error: error.toString() });
  }
});

// Create folder
router.post("/create-folder", (req, res) => {
  const { folderName, path: currentPath } = req.body;
  if (!folderName) {
    return res.status(400).json({ message: "Folder name is required!" });
  }

  const basePath = path.join(STORAGE_PATH, currentPath || "");

  const getNextAvailableFolderName = (baseName, basePath) => {
    let counter = 1;
    let newName = baseName;
    while (fs.existsSync(path.join(basePath, newName))) {
      newName = `${baseName}-${counter++}`;
    }
    return newName;
  };

  const finalFolderName = getNextAvailableFolderName(folderName, basePath);
  const fullPath = path.join(basePath, finalFolderName);
  folder_path = currentPath || "";

  try {
    fs.mkdirSync(fullPath, { recursive: true });
    if (!currentPath) {
      fs.mkdirSync(path.join(fullPath, "2D"));
      fs.mkdirSync(path.join(fullPath, "3D"));
    }
    res.json({ message: "Folder created successfully!", folderName: finalFolderName });
  } catch (error) {
    res.status(500).json({ message: "Error creating folder.", error: error.toString() });
  }
});

// Rename folder/file
router.post("/rename", (req, res) => {
  const { oldName, newName, path: itemPath = "" } = req.body;
  const oldPath = path.join(STORAGE_PATH, itemPath, oldName);
  const newPath = path.join(STORAGE_PATH, itemPath, newName);

  try {
    if (!fs.existsSync(oldPath)) return res.status(400).json({ message: "Item not found." });
    fs.renameSync(oldPath, newPath);
    res.json({ message: "Renamed successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error renaming item.", error: error.toString() });
  }
});

// Delete folder/file
router.post("/delete", (req, res) => {
  const { name, path: itemPath = "" } = req.body;
  const fullPath = path.join(STORAGE_PATH, itemPath, name);

  try {
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      return res.json({ message: "Deleted successfully!" });
    }
    res.status(400).json({ message: "Item not found!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item.", error: error.toString() });
  }
});

// Upload file using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(STORAGE_PATH, folder_path || "");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  res.json({
    message: "File uploaded successfully!",
    fileName: req.file.originalname,
    currentPath: folder_path || "",
  });
});

module.exports = router;
