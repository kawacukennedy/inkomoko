const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');
const OTP = require('../utils/otp');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;
    const identifier = email || phone;

    if (!full_name || !password || !identifier) {
      return res.status(400).json({ error: 'Name, password, and email or phone are required' });
    }

    // Check if user exists
    let existing;
    if (email) {
      existing = await db.query('SELECT id, is_verified FROM users WHERE email = $1', [email]);
    } else {
      existing = await db.query('SELECT id, is_verified FROM users WHERE phone = $1', [phone]);
    }

    const password_hash = await bcrypt.hash(password, 10);

    if (existing.rows.length > 0) {
      const user = existing.rows[0];
      if (user.is_verified) {
        return res.status(409).json({ error: 'This account already exists. Please log in.' });
      } else {
        // If not verified, allow re-signup/overwriting info and resend OTP
        await db.query(
          `UPDATE users SET full_name = $1, password_hash = $2, role = $3 WHERE id = $4`,
          [full_name, password_hash, role || 'youth', user.id]
        );
      }
    } else {
      // Create new user (unverified by default)
      await db.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, is_verified)
         VALUES ($1, $2, $3, $4, $5, FALSE)`,
        [full_name, email || null, phone || null, password_hash, role || 'youth']
      );
    }

    const otpCode = OTP.generateCode();
    await OTP.save(identifier, otpCode, 'signup');
    await OTP.send(identifier, otpCode, 'signup');

    res.status(201).json({ 
      message: 'Signup successful. Please verify your OTP.',
      otp_required: true,
      identifier,
      purpose: 'signup'
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const identifier = email || phone;

    if (!password || !identifier) {
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

    const otpCode = OTP.generateCode();
    await OTP.save(identifier, otpCode, 'login');
    await OTP.send(identifier, otpCode, 'login');

    res.json({ 
      message: 'OTP sent for verification',
      otp_required: true,
      identifier,
      purpose: 'login'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { identifier, code, purpose } = req.body;

    if (!identifier || !code || !purpose) {
      return res.status(400).json({ error: 'Missing verification data' });
    }

    const isValid = await OTP.verify(identifier, code, purpose);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Process based on purpose
    let result;
    if (identifier.includes('@')) {
      result = await db.query('SELECT * FROM users WHERE email = $1', [identifier]);
    } else {
      result = await db.query('SELECT * FROM users WHERE phone = $1', [identifier]);
    }

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (purpose === 'signup' || purpose === 'login') {
      // Mark as verified if it was signup
      if (purpose === 'signup') {
        await db.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [user.id]);
        user.is_verified = true;
      }

      const token = generateToken(user);
      delete user.password_hash;
      return res.json({ user, token });
    }

    if (purpose === 'reset') {
      return res.json({ message: 'OTP verified. You can now reset your password.', verified: true });
    }

    res.status(400).json({ error: 'Invalid purpose' });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ error: 'Identifier required' });

    let result;
    if (identifier.includes('@')) {
      result = await db.query('SELECT id FROM users WHERE email = $1', [identifier]);
    } else {
      result = await db.query('SELECT id FROM users WHERE phone = $1', [identifier]);
    }

    if (result.rows.length === 0) {
      // Don't reveal if user exists for security, just return success
      return res.json({ message: 'If account exists, OTP has been sent' });
    }

    const otpCode = OTP.generateCode();
    await OTP.save(identifier, otpCode, 'reset');
    await OTP.send(identifier, otpCode, 'reset');

    res.json({ message: 'Password reset OTP sent', otp_required: true, identifier, purpose: 'reset' });
  } catch (err) {
    console.error('Forgot pass error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { identifier, code, new_password } = req.body;
    if (!identifier || !code || !new_password) return res.status(400).json({ error: 'Missing data' });

    // We verify one last time here just in case, or we assume a secure token was given (simpler to verify code directly here)
    const isValid = await OTP.verify(identifier, code, 'reset');
    if (!isValid) return res.status(400).json({ error: 'Invalid code or expired' });

    const password_hash = await bcrypt.hash(new_password, 10);
    if (identifier.includes('@')) {
      await db.query('UPDATE users SET password_hash = $1 WHERE email = $2', [password_hash, identifier]);
    } else {
      await db.query('UPDATE users SET password_hash = $1 WHERE phone = $2', [password_hash, identifier]);
    }

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset pass error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
