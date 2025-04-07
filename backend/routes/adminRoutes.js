const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Add company
router.post("/add-company", async (req, res) => {
  const { code, name } = req.body;
  if (!code || !name) return res.status(400).json({ message: "Code and name are required!" });

  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.execute("SELECT * FROM companies WHERE code = ?", [code]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Company code already exists!" });
    }
    await conn.execute("INSERT INTO companies (code, name) VALUES (?, ?)", [code, name]);
    res.json({ message: "Company added successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error adding company.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Add assembly
router.post("/add-assembly", async (req, res) => {
  const { code, name } = req.body;
  if (!code || !name) return res.status(400).json({ message: "Code and name are required!" });

  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.execute("SELECT * FROM assemblies WHERE code = ?", [code]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Assembly code already exists!" });
    }
    await conn.execute("INSERT INTO assemblies (code, name) VALUES (?, ?)", [code, name]);
    res.json({ message: "Assembly added successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error adding assembly.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Get metadata
router.get("/get-metadata", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [companies] = await conn.execute("SELECT * FROM companies");
    const [assemblies] = await conn.execute("SELECT * FROM assemblies");
    res.json({ companies, assemblies });
  } catch (err) {
    res.status(500).json({ message: "Error fetching metadata.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Get all company codes
router.get('/company-codes', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [companies] = await conn.execute("SELECT code, name FROM companies");
    res.json({ total: companies.length, codes: companies });
  } catch (err) {
    res.status(500).json({ message: "Error fetching company codes.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Get all assembly codes
router.get("/assembly-codes", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [assemblies] = await conn.execute("SELECT code, name FROM assemblies");
    res.json({ total: assemblies.length, codes: assemblies });
  } catch (err) {
    res.status(500).json({ message: "Error fetching assembly codes.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Delete company
router.post("/delete-company", async (req, res) => {
  const { code } = req.body;
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute("DELETE FROM companies WHERE code = ?", [code]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Company not found!" });
    }
    res.json({ message: "Company deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting company.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Delete assembly
router.post("/delete-assembly", async (req, res) => {
  const { code } = req.body;
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute("DELETE FROM assemblies WHERE code = ?", [code]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Assembly not found!" });
    }
    res.json({ message: "Assembly deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting assembly.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Edit company
router.post("/edit-company", async (req, res) => {
  const { oldCode, newCode, newName } = req.body;
  if (!oldCode || !newCode || !newName) {
    return res.status(400).json({ message: "Old code, new code, and new name are required!" });
  }

  const conn = await pool.getConnection();
  try {
    // Check if company with oldCode exists
    const [existingCompany] = await conn.execute("SELECT * FROM companies WHERE code = ?", [oldCode]);
    if (existingCompany.length === 0) {
      return res.status(404).json({ message: "Company not found!" });
    }

    // If code is changing, make sure newCode isn't already taken
    if (oldCode !== newCode) {
      const [conflict] = await conn.execute("SELECT * FROM companies WHERE code = ?", [newCode]);
      if (conflict.length > 0) {
        return res.status(400).json({ message: "New company code already exists!" });
      }
    }

    await conn.execute("UPDATE companies SET code = ?, name = ? WHERE code = ?", [newCode, newName, oldCode]);
    res.json({ message: "Company updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error editing company.", error: err.toString() });
  } finally {
    conn.release();
  }
});


// Edit assembly
router.post("/edit-assembly", async (req, res) => {
  const { oldCode, newCode, newName } = req.body;
  if (!oldCode || !newCode || !newName) {
    return res.status(400).json({ message: "Old code, new code, and new name are required!" });
  }

  const conn = await pool.getConnection();
  try {
    const [existingAssembly] = await conn.execute("SELECT * FROM assemblies WHERE code = ?", [oldCode]);
    if (existingAssembly.length === 0) {
      return res.status(404).json({ message: "Assembly not found!" });
    }

    if (oldCode !== newCode) {
      const [conflict] = await conn.execute("SELECT * FROM assemblies WHERE code = ?", [newCode]);
      if (conflict.length > 0) {
        return res.status(400).json({ message: "New assembly code already exists!" });
      }
    }

    await conn.execute("UPDATE assemblies SET code = ?, name = ? WHERE code = ?", [newCode, newName, oldCode]);
    res.json({ message: "Assembly updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error editing assembly.", error: err.toString() });
  } finally {
    conn.release();
  }
});


module.exports = router;
