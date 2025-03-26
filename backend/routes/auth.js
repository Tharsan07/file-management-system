// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../models');
const secret = 'your_jwt_secret'; // Replace with process.env.JWT_SECRET in production

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.User.create({ username, password });
    res.json({ message: 'User registered successfully', userId: user.id });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.User.findOne({ where: { username } });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.validatePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

module.exports = router;
