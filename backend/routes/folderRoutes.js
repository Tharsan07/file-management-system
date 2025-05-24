  const express = require("express");
  const fs = require("fs");
  const path = require("path");
  const multer = require("multer");
  const db = require("../models"); // Adjust path if needed
  const { Op } = require("sequelize");

  const router = express.Router();

  const STORAGE_PATH = process.env.STORAGE_PATH || path.join(__dirname, "..", "upload");
  let folder_path = "";

  // Ensure storage path exists
  if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
  }

  // List files/folders
  router.get("/list", async (req, res) => {
    const requestedPath = req.query.path || "";
    folder_path = requestedPath;
    const fullPath = path.join(STORAGE_PATH, requestedPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "Directory not found." });
    }

    try {
      const items = await Promise.all(fs.readdirSync(fullPath).map(async (name) => {
        const fullItemPath = path.join(fullPath, name);
        const stats = fs.statSync(fullItemPath);
        const isDirectory = stats.isDirectory();
        
        // Get metadata for files
        let metadata = null;
        if (!isDirectory) {
          const relativePath = path.join(requestedPath, name);
          metadata = await db.Metadata.findOne({ 
            where: { filePath: relativePath }
          });
        }

        return {
          name,
          type: isDirectory ? "folder" : "file",
          createdAt: stats.birthtime,
          ...(metadata ? metadata.toJSON() : {}),
          path: path.join(requestedPath, name)
        };
      }));

      // Sort by type (folders first) and then by name
      const sortedItems = items.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      res.json(sortedItems);
    } catch (error) {
      console.error('Error reading directory:', error);
      res.status(500).json({
        message: "Error reading directory.",
        error: error.toString(),
      });
    }
  });


  // Create folder
  router.post("/create-folder", async (req, res) => {
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

      // Also create subfolders if it's at the root level
      if (!currentPath) {
        fs.mkdirSync(path.join(fullPath, "2D-Drawing"));
        fs.mkdirSync(path.join(fullPath, "3D-Model"));
      }

      // ✅ Store in metadata DB
      await db.Metadata.create({
        fileName: finalFolderName,
        filePath: path.join(currentPath || "", finalFolderName),
        type: "folder"
      });

      res.json({ message: "Folder created successfully!", folderName: finalFolderName });
    } catch (error) {
      res.status(500).json({ message: "Error creating folder.", error: error.toString() });
    }
  });


  // Rename folder/file
  router.post("/rename", async (req, res) => {
    const { oldName, newName, path: itemPath = "" } = req.body;
    const oldPath = path.join(STORAGE_PATH, itemPath, oldName);
    const newPath = path.join(STORAGE_PATH, itemPath, newName);

    try {
      if (!fs.existsSync(oldPath)) return res.status(400).json({ message: "Item not found." });

      fs.renameSync(oldPath, newPath);

      // Update DB if it's a file
      const oldRelativePath = path.join(itemPath, oldName);
      const newRelativePath = path.join(itemPath, newName);

      const metadata = await db.Metadata.findOne({ where: { filePath: oldRelativePath } });
      if (metadata) {
        metadata.fileName = newName;
        metadata.filePath = newRelativePath;
        await metadata.save();
      }

      res.json({ message: "Renamed successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error renaming item.", error: error.toString() });
    }
  });


  // Delete folder/file
  router.post("/delete", async (req, res) => {
    const { name, path: itemPath = "" } = req.body;
    const fullPath = path.join(STORAGE_PATH, itemPath, name);

    try {
      if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });

        // Delete from DB if it's a file
        const relativePath = path.join(itemPath, name);
        await db.Metadata.destroy({ where: { filePath: relativePath } });

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

  router.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    try {
      const relativePath = path.join(folder_path || "", req.file.originalname);

      // Store in DB
      await db.Metadata.create({
        fileName: req.file.originalname,
        filePath: relativePath
      });

      res.json({
        message: "File uploaded and metadata saved successfully!",
        fileName: req.file.originalname,
        currentPath: folder_path || "",
      });
    } catch (error) {
      res.status(500).json({ message: "Error saving metadata.", error: error.toString() });
    }
  });

  async function searchDirectory(dirPath, query, year, companyCode, assemblyCode) {
    const results = [];
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(STORAGE_PATH, fullPath).replace(/\\/g, '/');
  
        if (entry.isDirectory()) {
          // For folders, check if name matches search query
          const matchesQuery = !query || entry.name.toLowerCase().includes(query.toLowerCase());
  
          // For folders, check if the folder name matches any active filters
          const matchesYear = !year || entry.name.includes(year);
          const matchesCompanyCode = !companyCode || entry.name.includes(companyCode);
          const matchesAssemblyCode = !assemblyCode || entry.name.includes(assemblyCode);
  
          // Add folder if it matches search and all active filters
          if (matchesQuery && matchesYear && matchesCompanyCode && matchesAssemblyCode) {
            const stats = await fs.promises.stat(fullPath);
            results.push({
              name: entry.name,
              type: 'folder',
              path: relativePath,
              createdAt: stats.birthtime
            });
          }
  
          // Recursively search inside the folder
          const subResults = await searchDirectory(fullPath, query, year, companyCode, assemblyCode);
          results.push(...subResults);
        } else {
          // For files, first check metadata
          const metadata = await db.Metadata.findOne({
            where: {
              filePath: relativePath
            }
          });
  
          // Check if file matches search query
          const matchesQuery = !query || 
            entry.name.toLowerCase().includes(query.toLowerCase()) ||
            relativePath.toLowerCase().includes(query.toLowerCase());
  
          // Check if file matches all active filters
          const matchesYear = !year || (metadata && metadata.year === year);
          const matchesCompanyCode = !companyCode || (metadata && metadata.companyCode === companyCode);
          const matchesAssemblyCode = !assemblyCode || (metadata && metadata.assemblyCode === assemblyCode);
  
          // Add file if it matches search and all active filters
          if (matchesQuery && matchesYear && matchesCompanyCode && matchesAssemblyCode) {
            const stats = await fs.promises.stat(fullPath);
            results.push({
              name: entry.name,
              type: 'file',
              path: relativePath,
              createdAt: stats.birthtime,
              ...(metadata ? metadata.toJSON() : {})
            });
          }
        }
      }
    } catch (error) {
      console.error('Error searching directory:', error);
    }
    return results;
  }
  
  // Search files/folders in the database with filters
  router.get("/search", async (req, res) => {
    const { query, year, companyCode, assemblyCode } = req.query;
  
    try {
      const results = await searchDirectory(STORAGE_PATH, query || '', year, companyCode, assemblyCode);
      // Sort results by type (folders first) and then by name
      const sortedResults = results.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      res.json(sortedResults);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: "Error searching files.", error: error.toString() });
    }
  });
 

  module.exports = router;
