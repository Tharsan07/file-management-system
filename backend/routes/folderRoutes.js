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

// Helper: parse comma separated string query params to array
const parseCSV = (str) => (str ? str.split(",").map((s) => s.trim()) : []);

// --- List files/folders with filters ---
router.get("/list", async (req, res) => {
  try {
    const {
      path: requestedPath = "",
      query = "",
      year = "",
      companyCode = "",
      assemblyCode = "",
      createdFrom,
      createdTo,
      type, // "file", "folder", or undefined (both)
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    const fullPath = path.join(STORAGE_PATH, requestedPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "Directory not found." });
    }

    const years = parseCSV(year);
    const companyCodes = parseCSV(companyCode);
    const assemblyCodes = parseCSV(assemblyCode);

    const items = await Promise.all(
      fs.readdirSync(fullPath).map(async (name) => {
        const fullItemPath = path.join(fullPath, name);
        const stats = fs.statSync(fullItemPath);
        const isDirectory = stats.isDirectory();

        // Filter by type if provided
        if (type && type !== (isDirectory ? "folder" : "file")) {
          return null;
        }

        // Get metadata for files
        let metadata = null;
        if (!isDirectory) {
          const relativePath = path.join(requestedPath, name).replace(/\\/g, "/");
          metadata = await db.Metadata.findOne({
            where: { filePath: relativePath },
          });
        }

        // Filter by query (name or metadata fields)
        const lowerName = name.toLowerCase();
        const lowerQuery = query.toLowerCase();

        const matchesQuery =
          !query ||
          lowerName.includes(lowerQuery) ||
          (metadata &&
            (metadata.fileName?.toLowerCase().includes(lowerQuery) ||
              metadata.filePath?.toLowerCase().includes(lowerQuery)));

        // Filter by year, companyCode, assemblyCode (only files have metadata)
        const matchesYear = !years.length || (metadata && years.includes(metadata.year));
        const matchesCompanyCode =
          !companyCodes.length || (metadata && companyCodes.includes(metadata.companyCode));
        const matchesAssemblyCode =
          !assemblyCodes.length || (metadata && assemblyCodes.includes(metadata.assemblyCode));

        // Filter by creation date range
        const createdTime = stats.birthtime.getTime();
        const fromTime = createdFrom ? new Date(createdFrom).getTime() : null;
        const toTime = createdTo ? new Date(createdTo).getTime() : null;
        const matchesCreatedFrom = !fromTime || createdTime >= fromTime;
        const matchesCreatedTo = !toTime || createdTime <= toTime;

        if (
          matchesQuery &&
          matchesYear &&
          matchesCompanyCode &&
          matchesAssemblyCode &&
          matchesCreatedFrom &&
          matchesCreatedTo
        ) {
          return {
            name,
            type: isDirectory ? "folder" : "file",
            createdAt: stats.birthtime,
            ...(metadata ? metadata.toJSON() : {}),
            path: path.join(requestedPath, name).replace(/\\/g, "/"),
          };
        }
        return null;
      })
    );

    // Remove nulls after filtering
    const filteredItems = items.filter(Boolean);

    // Sort results
    const sortedItems = filteredItems.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === "createdAt") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA === undefined || valA === null) valA = typeof valB === "number" ? 0 : "";
      if (valB === undefined || valB === null) valB = typeof valA === "number" ? 0 : "";

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    res.json(sortedItems);
  } catch (error) {
    console.error("Error reading directory:", error);
    res.status(500).json({
      message: "Error reading directory.",
      error: error.toString(),
    });
  }
});

// --- Create folder ---
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

    // Store in metadata DB
    await db.Metadata.create({
      fileName: finalFolderName,
      filePath: path.join(currentPath || "", finalFolderName).replace(/\\/g, "/"),
      type: "folder",
    });

    res.json({ message: "Folder created successfully!", folderName: finalFolderName });
  } catch (error) {
    res.status(500).json({ message: "Error creating folder.", error: error.toString() });
  }
});

// --- Rename folder/file ---
router.post("/rename", async (req, res) => {
  const { oldName, newName, path: itemPath = "" } = req.body;
  const oldPath = path.join(STORAGE_PATH, itemPath, oldName);
  const newPath = path.join(STORAGE_PATH, itemPath, newName);

  try {
    if (!fs.existsSync(oldPath)) return res.status(400).json({ message: "Item not found." });

    fs.renameSync(oldPath, newPath);

    // Update DB if it's a file
    const oldRelativePath = path.join(itemPath, oldName).replace(/\\/g, "/");
    const newRelativePath = path.join(itemPath, newName).replace(/\\/g, "/");

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

// --- Delete folder/file ---
router.post("/delete", async (req, res) => {
  const { name, path: itemPath = "" } = req.body;
  const fullPath = path.join(STORAGE_PATH, itemPath, name);

  try {
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });

      // Delete from DB if it's a file
      const relativePath = path.join(itemPath, name).replace(/\\/g, "/");
      await db.Metadata.destroy({ where: { filePath: relativePath } });

      return res.json({ message: "Deleted successfully!" });
    }
    res.status(400).json({ message: "Item not found!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item.", error: error.toString() });
  }
});

// --- Upload file using multer ---
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
    const relativePath = path.join(folder_path || "", req.file.originalname).replace(/\\/g, "/");

    // Store in DB
    await db.Metadata.create({
      fileName: req.file.originalname,
      filePath: relativePath,
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

// --- Recursive search directory with filters ---
async function searchDirectory(
  dirPath,
  query,
  years,
  companyCodes,
  assemblyCodes,
  createdFrom,
  createdTo
) {
  const results = [];
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(STORAGE_PATH, fullPath).replace(/\\/g, "/");
      const stats = await fs.promises.stat(fullPath);

      if (entry.isDirectory()) {
        // For folders, match query and filters on folder name and creation date
        const matchesQuery = !query || entry.name.toLowerCase().includes(query.toLowerCase());
        const createdTime = stats.birthtime.getTime();
        const fromTime = createdFrom ? new Date(createdFrom).getTime() : null;
        const toTime = createdTo ? new Date(createdTo).getTime() : null;
        const matchesCreatedFrom = !fromTime || createdTime >= fromTime;
        const matchesCreatedTo = !toTime || createdTime <= toTime;

        if (matchesQuery && matchesCreatedFrom && matchesCreatedTo) {
          results.push({
            name: entry.name,
            type: "folder",
            path: relativePath,
            createdAt: stats.birthtime,
          });
        }

        // Recursively search inside folder
        const subResults = await searchDirectory(
          fullPath,
          query,
          years,
          companyCodes,
          assemblyCodes,
          createdFrom,
          createdTo
        );
        results.push(...subResults);
      } else if (entry.isFile()) {
        // For files, check metadata for filters and query
        const metadata = await db.Metadata.findOne({ where: { filePath: relativePath } });

        const matchesQuery =
          !query ||
          entry.name.toLowerCase().includes(query.toLowerCase()) ||
          (metadata &&
            (metadata.fileName?.toLowerCase().includes(query.toLowerCase()) ||
              metadata.filePath?.toLowerCase().includes(query.toLowerCase())));

        const matchesYear = !years.length || (metadata && years.includes(metadata.year));
        const matchesCompanyCode =
          !companyCodes.length || (metadata && companyCodes.includes(metadata.companyCode));
        const matchesAssemblyCode =
          !assemblyCodes.length || (metadata && assemblyCodes.includes(metadata.assemblyCode));

        const createdTime = stats.birthtime.getTime();
        const fromTime = createdFrom ? new Date(createdFrom).getTime() : null;
        const toTime = createdTo ? new Date(createdTo).getTime() : null;
        const matchesCreatedFrom = !fromTime || createdTime >= fromTime;
        const matchesCreatedTo = !toTime || createdTime <= toTime;

        if (
          matchesQuery &&
          matchesYear &&
          matchesCompanyCode &&
          matchesAssemblyCode &&
          matchesCreatedFrom &&
          matchesCreatedTo
        ) {
          results.push({
            name: entry.name,
            type: "file",
            path: relativePath,
            createdAt: stats.birthtime,
            ...(metadata ? metadata.toJSON() : {}),
          });
        }
      }
    }
  } catch (error) {
    console.error("Error during recursive search:", error);
  }
  return results;
}

// --- Search endpoint ---
router.get("/search", async (req, res) => {
  try {
    const {
      query = "",
      year = "",
      companyCode = "",
      assemblyCode = "",
      createdFrom,
      createdTo,
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    const years = parseCSV(year);
    const companyCodes = parseCSV(companyCode);
    const assemblyCodes = parseCSV(assemblyCode);

    const results = await searchDirectory(
      STORAGE_PATH,
      query,
      years,
      companyCodes,
      assemblyCodes,
      createdFrom,
      createdTo
    );

    // Sort results
    const sortedResults = results.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === "createdAt") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA === undefined || valA === null) valA = typeof valB === "number" ? 0 : "";
      if (valB === undefined || valB === null) valB = typeof valA === "number" ? 0 : "";

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    res.json(sortedResults);
  } catch (error) {
    res.status(500).json({ message: "Error during search.", error: error.toString() });
  }
});

// --- Open file with application ---
router.post("/open-with", async (req, res) => {
  const { filePath, appName } = req.body;
  const fullPath = path.join(STORAGE_PATH, filePath);

  try {
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "File not found." });
    }

    // Map application names to their executable paths
    const appPaths = {
      'Default Application': null, // Will use system default
      // CAD and Engineering Software
      'AutoCAD': 'acad.exe',
      'DraftSight': 'DraftSight.exe',
      'BricsCAD': 'BricsCAD.exe',
      'LibreCAD': 'librecad.exe',
      'AutoCAD MEP': 'acad.exe',
      'Revit MEP': 'Revit.exe',
      'HydraCAD': 'HydraCAD.exe',
      // Common Applications
      'Notepad': 'notepad.exe',
      'Microsoft Word': 'WINWORD.EXE',
      'Adobe Acrobat': 'Acrobat.exe',
      'Chrome': 'chrome.exe',
      'Windows Media Player': 'wmplayer.exe',
      'Visual Studio Code': 'code.exe',
      'LibreOffice Writer': 'soffice.exe',
      'Photos': 'ms-photos:',
      'Paint': 'mspaint.exe',
      'Groove Music': 'mswindowsmusic:',
      'VLC Media Player': 'vlc.exe',
      'Movies & TV': 'ms-movies:',
      'Notepad++': 'notepad++.exe',
      'Sublime Text': 'sublime_text.exe',
      'Microsoft Edge': 'msedge.exe'
    };

    const appPath = appPaths[appName];
    if (!appPath && appName !== 'Default Application') {
      return res.status(400).json({ message: "Unsupported application." });
    }

    // Use the appropriate command based on the OS
    let command;
    if (appName === 'Default Application') {
      command = `start "" "${fullPath}"`;  // Windows default
    } else if (appPath.startsWith('ms-')) {
      // Handle Windows Store apps
      command = `start ${appPath} "${fullPath}"`;
    } else {
      // For CAD and engineering software, we need to ensure the correct working directory
      const appDir = path.dirname(appPath);
      command = `cd /d "${appDir}" && start "" "${appPath}" "${fullPath}"`;
    }

    require('child_process').exec(command, (error) => {
      if (error) {
        console.error('Error opening file:', error);
        return res.status(500).json({ message: "Error opening file.", error: error.toString() });
      }
      res.json({ message: "File opened successfully!" });
    });
  } catch (error) {
    res.status(500).json({ message: "Error opening file.", error: error.toString() });
  }
});

module.exports = router;
