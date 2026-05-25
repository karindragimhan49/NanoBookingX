const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO users (full_name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role',
      [fullName.trim(), email.toLowerCase(), hashed, phone || null]
    );
    const user = result.rows[0];
    const token = generateToken(user.id);
    res.status(201).json({ success: true, token, user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const result = await query('SELECT * FROM users WHERE email = $1 AND is_active = TRUE', [email.toLowerCase()]);
    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = generateToken(user.id);
    res.json({ success: true, token, user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, full_name, email, role, phone, is_active, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    const u = result.rows[0];
    res.json({ success: true, user: { id: u.id, fullName: u.full_name, email: u.email, role: u.role, phone: u.phone, createdAt: u.created_at } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, full_name, email, role, phone, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users: result.rows.map(u => ({ id: u.id, fullName: u.full_name, email: u.email, role: u.role, phone: u.phone, isActive: u.is_active, createdAt: u.created_at })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;
    const fields = [];
    const values = [];
    let i = 1;
    if (role !== undefined) { fields.push(`role = $${i++}`); values.push(role); }
    if (isActive !== undefined) { fields.push(`is_active = $${i++}`); values.push(isActive); }
    if (!fields.length) return res.status(400).json({ success: false, message: 'No fields to update' });
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, full_name, email, role, is_active`,
      values
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    const u = result.rows[0];
    res.json({ success: true, user: { id: u.id, fullName: u.full_name, email: u.email, role: u.role, isActive: u.is_active } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
