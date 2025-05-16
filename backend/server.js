const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = 5000;

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require("./routes/auth");
const folderRoutes = require("./routes/folderRoutes");
const adminRoutes = require("./routes/adminRoutes");
// backend/server.js
app.use("/api/auth", authRoutes);
app.use("/api/folder", folderRoutes);
app.use("/api/admin", adminRoutes);


// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
