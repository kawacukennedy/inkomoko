'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');
const OTP = require('../utils/otp');

const router = express.Router();

const BCRYPT_ROUNDS = 12;

const USER_FIELDS = [
  'id', 'full_name', 'email', 'phone', 'role', 'avatar_url',
  'region', 'province', 'language_pref', 'cultural_background',
  'voice_intro_url', 'interests', 'bio', 'clan', 'age',
  'is_verified', 'onboarding_status', 'created_at',
];

function formatUserResponse(user) {
  const formatted = {};
  USER_FIELDS.forEach((field) => {
    formatted[field] = user[field];
  });
  return formatted;
}

async function findUserByEmailOrPhone(identifier) {
  const query = identifier.includes('@')
    ? 'SELECT * FROM users WHERE email = $1'
    : 'SELECT * FROM users WHERE phone = $1';

  const result = await db.query(query, [identifier]);
  return result.rows[0] || null;
}

router.post('/signup', async (req, res, next) => {
  try {
    const { full_name, email, phone, password, role } = req.body;
    const identifier = email || phone;

    if (!full_name || !password || !identifier) {
      return res.status(400).json({
        error: 'Name, password, and email or phone are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters',
      });
    }

    const existing = await findUserByEmailOrPhone(identifier);

    if (existing && existing.is_verified) {
      return res.status(409).json({
        error: 'This account already exists. Please log in.',
      });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    if (existing) {
      await db.query(
        `UPDATE users
         SET full_name = $1, password_hash = $2, role = $3, is_verified = FALSE
         WHERE id = $4`,
        [full_name, passwordHash, role || 'youth', existing.id]
      );
    } else {
      await db.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, is_verified)
         VALUES ($1, $2, $3, $4, $5, FALSE)`,
        [full_name, email || null, phone || null, passwordHash, role || 'youth']
      );
    }

    const otpCode = OTP.generateCode();
    await OTP.save(identifier, otpCode, 'signup');
    await OTP.send(identifier, otpCode, 'signup');

    res.status(201).json({
      message: 'Signup successful. Please verify your OTP.',
      otp_required: true,
      identifier,
      purpose: 'signup',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;
    const identifier = email || phone;

    if (!password || !identifier) {
      return res.status(400).json({
        error: 'Email/phone and password are required',
      });
    }

    const user = await findUserByEmailOrPhone(identifier);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

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
      purpose: 'login',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/verify-otp', async (req, res, next) => {
  try {
    const { identifier, code, purpose } = req.body;

    if (!identifier || !code || !purpose) {
      return res.status(400).json({ error: 'Missing verification data' });
    }

    const isValid = await OTP.verify(identifier, code, purpose);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const user = await findUserByEmailOrPhone(identifier);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (purpose === 'signup') {
      await db.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [user.id]);
      user.is_verified = true;
    }

    if (purpose === 'signup' || purpose === 'login') {
      const token = generateToken(user);

      return res.json({
        user: formatUserResponse(user),
        token,
      });
    }

    if (purpose === 'reset') {
      return res.json({
        message: 'OTP verified. You can now reset your password.',
        verified: true,
      });
    }

    res.status(400).json({ error: 'Invalid purpose' });
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: 'Email or phone is required' });
    }

    const user = await findUserByEmailOrPhone(identifier);

    if (!user) {
      return res.json({
        message: 'If account exists, OTP has been sent',
      });
    }

    const otpCode = OTP.generateCode();
    await OTP.save(identifier, otpCode, 'reset');
    await OTP.send(identifier, otpCode, 'reset');

    res.json({
      message: 'Password reset OTP sent',
      otp_required: true,
      identifier,
      purpose: 'reset',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { identifier, code, new_password } = req.body;

    if (!identifier || !code || !new_password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters',
      });
    }

    const isValid = await OTP.verify(identifier, code, 'reset');

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    const passwordHash = await bcrypt.hash(new_password, BCRYPT_ROUNDS);

    const query = identifier.includes('@')
      ? 'UPDATE users SET password_hash = $1 WHERE email = $2'
      : 'UPDATE users SET password_hash = $1 WHERE phone = $2';

    await db.query(query, [passwordHash, identifier]);

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
