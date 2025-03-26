const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const path = require('path');
const fs = require('fs');
const db = require('../models');

// Storage with Folder Structure
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { year, companyCode, assemblyCode, extraCode } = req.body;

    if (!year || !companyCode || !assemblyCode || !extraCode) {
      return cb(new Error('Missing required metadata (year, companyCode, assemblyCode, extraCode)'));
    }

    const uploadPath = path.join(__dirname, `../uploads/${year}/${companyCode}/${assemblyCode}/${extraCode}`);
    fs.mkdirSync(uploadPath, { recursive: true }); // Create directories if not exist
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST /api/files/upload
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const { year, companyCode, assemblyCode, extraCode } = req.body;
    const filePath = req.file.path;

    const fileRecord = await db.File.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      filePath,
      year,
      companyCode,
      assemblyCode,
      extraCode,
      userId: req.userId
    });

    res.json({ message: 'File uploaded successfully', file: fileRecord });
  } catch (err) {
    res.status(500).json({ message: 'Error saving file record', error: err.message });
  }
});

// GET /api/files/ (Retrieve files efficiently)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { year, companyCode, assemblyCode, extraCode } = req.query;
    let whereClause = { userId: req.userId };

    if (year) whereClause.year = year;
    if (companyCode) whereClause.companyCode = companyCode;
    if (assemblyCode) whereClause.assemblyCode = assemblyCode;
    if (extraCode) whereClause.extraCode = extraCode;

    const files = await db.File.findAll({ where: whereClause });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving files', error: err.message });
  }
});

module.exports = router;
