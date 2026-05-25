const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query('SELECT id, full_name, email, role, is_active FROM users WHERE id = $1', [decoded.id]);
    if (!result.rows.length || !result.rows[0].is_active) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }
    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

const optionalProtect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await query('SELECT id, full_name, email, role FROM users WHERE id = $1', [decoded.id]);
      if (result.rows.length) req.user = result.rows[0];
    }
  } catch {
    // continue without user
  }
  next();
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied: insufficient permissions' });
  }
  next();
};

module.exports = { protect, optionalProtect, restrictTo };
