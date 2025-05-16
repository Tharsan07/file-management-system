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
  router.get("/list", (req, res) => {
    const requestedPath = req.query.path || "";
    folder_path = requestedPath;
    const fullPath = path.join(STORAGE_PATH, requestedPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "Directory not found." });
    }

    try {
      const items = fs.readdirSync(fullPath).map((name) => {
        const fullItemPath = path.join(fullPath, name);
        const stats = fs.statSync(fullItemPath);

        return {
          name,
          type: stats.isDirectory() ? "folder" : "file",
          createdAt: stats.birthtime, // Get file creation time
        };
      });

      // ✅ Sort by createdAt (newest first)
      const sortedItems = items.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      

      res.json(sortedItems);
    } catch (error) {
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
        const relativePath = path.relative(STORAGE_PATH, fullPath);
        
        if (entry.isDirectory()) {
          // Add folder to results if it matches the search criteria
          if (entry.name.toLowerCase().includes(query.toLowerCase())) {
            const stats = await fs.promises.stat(fullPath);
            results.push({
              name: entry.name,
              type: 'folder',
              path: relativePath,
              fullPath: fullPath,
              createdAt: stats.birthtime
            });
          }
          // Recursively search inside the folder
          const subResults = await searchDirectory(fullPath, query, year, companyCode, assemblyCode);
          results.push(...subResults);
        } else {
          // For files, check metadata
          const metadata = await db.Metadata.findOne({ 
            where: { 
              filePath: relativePath,
              ...(year && { year }),
              ...(companyCode && { companyCode }),
              ...(assemblyCode && { assemblyCode })
            }
          });

          if (metadata) {
            const matchesQuery = metadata.fileName.toLowerCase().includes(query.toLowerCase());
            if (matchesQuery) {
              const stats = await fs.promises.stat(fullPath);
              results.push({
                ...metadata.toJSON(),
                type: 'file',
                path: relativePath,
                fullPath: fullPath,
                createdAt: stats.birthtime
              });
            }
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
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    try {
      const results = await searchDirectory(STORAGE_PATH, query, year, companyCode, assemblyCode);
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
