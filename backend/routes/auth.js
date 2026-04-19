const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    if (!full_name || !password || (!email && !phone)) {
      return res.status(400).json({ error: 'Name, password, and email or phone are required' });
    }

    if (role && !['elder', 'youth'].includes(role)) {
      return res.status(400).json({ error: 'Role must be elder or youth' });
    }

    // Check if user exists
    if (email) {
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Email already registered' });
      }
    }
    if (phone) {
      const existing = await db.query('SELECT id FROM users WHERE phone = $1', [phone]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Phone number already registered' });
      }
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, phone, role, is_onboarded, created_at`,
      [full_name, email || null, phone || null, password_hash, role || 'youth']
    );

    const user = result.rows[0];
    const token = generateToken(user);

    // Create default settings
    await db.query('INSERT INTO user_settings (user_id) VALUES ($1)', [user.id]);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!password || (!email && !phone)) {
      return res.status(400).json({ error: 'Email/phone and password are required' });
    }

    let result;
    if (email) {
      result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    } else {
      result = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
    }

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    // Remove sensitive fields
    delete user.password_hash;

    res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
