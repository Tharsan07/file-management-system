// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const secret = 'your_jwt_secret'; // Replace with process.env.JWT_SECRET in production

module.exports = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token)
    return res.status(401).json({ message: 'No token provided.' });

  jwt.verify(token, secret, (err, decoded) => {
    if (err)
      return res.status(500).json({ message: 'Failed to authenticate token.' });
    req.userId = decoded.id;
    next();
  });
};
