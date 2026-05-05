'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');
const { createAuthRateLimiter, createOtpRateLimiter } = require('../utils/rate-limiter');
const { validateName, validateIdentifier, validatePassword, validateOtpCode, sanitize, getIdentifierType } = require('../utils/validation');

const router = express.Router();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;

const SAFE_USER_FIELDS = [
  'id', 'full_name', 'email', 'phone', 'role', 'avatar_url',
  'region', 'province', 'language_pref', 'cultural_background',
  'voice_intro_url', 'interests', 'bio', 'clan', 'age',
  'is_verified', 'onboarding_status', 'created_at',
];

const authRateLimiter = createAuthRateLimiter({
  windowMs: parseInt(process.env.AUTH_RATE_WINDOW_MS, 10) || 10 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_MAX, 10) || 5,
});

const otpRateLimiter = createOtpRateLimiter({
  windowMs: parseInt(process.env.OTP_RATE_WINDOW_MS, 10) || 5 * 60 * 1000,
  max: parseInt(process.env.OTP_RATE_MAX, 10) || 3,
});

function formatUser(user) {
  const result = {};
  for (const field of SAFE_USER_FIELDS) {
    result[field] = user[field];
  }
  return result;
}

async function findUser(identifier) {
  const type = getIdentifierType(identifier);
  const column = type === 'email' ? 'email' : 'phone';
  const result = await db.query(
    `SELECT id, full_name, email, phone, password_hash, role, avatar_url,
            region, province, language_pref, cultural_background, voice_intro_url,
            interests, bio, clan, age, is_verified, onboarding_status, created_at
     FROM users WHERE ${column} = $1`,
    [identifier]
  );
  return result.rows[0] || null;
}

async function updatePassword(identifier, passwordHash) {
  const type = getIdentifierType(identifier);
  const column = type === 'email' ? 'email' : 'phone';
  await db.query(
    `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE ${column} = $2`,
    [passwordHash, identifier]
  );
}

async function verifyUser(userId) {
  await db.query(
    'UPDATE users SET is_verified = TRUE, updated_at = NOW() WHERE id = $1',
    [userId]
  );
}

async function completeAuthFlow(user, purpose) {
  if (purpose === 'signup') {
    await verifyUser(user.id);
    user.is_verified = true;
  }

  const token = generateToken(user);

  return {
    user: formatUser(user),
    token,
  };
}

function getAuthPurpose(purpose) {
  if (['signup', 'login', 'reset'].includes(purpose)) return purpose;
  return null;
}

router.post('/signup', authRateLimiter, async (req, res, next) => {
  try {
    const { full_name, email, phone, password, role } = req.body;
    const identifier = email || phone;

    const nameError = validateName(full_name);
    if (nameError) return res.status(400).json({ error: nameError });

    const idError = validateIdentifier(identifier);
    if (idError) return res.status(400).json({ error: idError });

    const passError = validatePassword(password);
    if (passError) return res.status(400).json({ error: passError });

    const existing = await findUser(identifier);

    if (existing && existing.is_verified) {
      return res.status(409).json({ error: 'Account already exists. Please sign in.' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    if (existing) {
      await db.query(
        `UPDATE users SET full_name = $1, password_hash = $2, role = $3, is_verified = FALSE, updated_at = NOW()
         WHERE id = $4`,
        [sanitize(full_name), passwordHash, role || 'youth', existing.id]
      );
    } else {
      await db.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, is_verified)
         VALUES ($1, $2, $3, $4, $5, FALSE)`,
        [sanitize(full_name), email || null, phone || null, passwordHash, role || 'youth']
      );
    }

    const OTP = require('../utils/otp');
    const otpCode = OTP.generateCode();
    const user = await findUser(identifier);

    await Promise.allSettled([
      OTP.save(identifier, otpCode, 'signup', user.id),
      OTP.send(identifier, otpCode, 'signup'),
    ]);

    const isDev = process.env.NODE_ENV !== 'production';

    res.status(201).json({
      message: 'Verification code sent',
      identifier,
      purpose: 'signup',
      otp_required: true,
      ...(isDev && { dev_otp: otpCode }),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;
    const identifier = email || phone;

    const idError = validateIdentifier(identifier);
    if (idError) return res.status(400).json({ error: idError });

    if (!password) return res.status(400).json({ error: 'Password is required' });

    const user = await findUser(identifier);

    if (!user) {
      await bcrypt.hash(password, 4);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const OTP = require('../utils/otp');
    const otpCode = OTP.generateCode();

    await Promise.allSettled([
      OTP.save(identifier, otpCode, 'login', user.id),
      OTP.send(identifier, otpCode, 'login'),
    ]);

    const isDev = process.env.NODE_ENV !== 'production';

    res.json({
      message: 'Verification code sent',
      identifier,
      purpose: 'login',
      otp_required: true,
      ...(isDev && { dev_otp: otpCode }),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/verify-otp', otpRateLimiter, async (req, res, next) => {
  try {
    const { identifier, code, purpose } = req.body;

    if (!identifier || !code || !purpose) {
      return res.status(400).json({ error: 'Identifier, code, and purpose are required' });
    }

    const idError = validateIdentifier(identifier);
    if (idError) return res.status(400).json({ error: idError });

    const codeError = validateOtpCode(code);
    if (codeError) return res.status(400).json({ error: codeError });

    const authPurpose = getAuthPurpose(purpose);
    if (!authPurpose) return res.status(400).json({ error: 'Invalid purpose' });

    const OTP = require('../utils/otp');
    const isValid = await OTP.verify(identifier, code, authPurpose);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    const user = await findUser(identifier);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (authPurpose === 'signup' || authPurpose === 'login') {
      const result = await completeAuthFlow(user, authPurpose);
      return res.json(result);
    }

    if (authPurpose === 'reset') {
      return res.json({
        message: 'Code verified',
        verified: true,
        identifier,
      });
    }

    res.status(400).json({ error: 'Invalid purpose' });
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-password', authRateLimiter, async (req, res, next) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: 'Email or phone is required' });
    }

    const idError = validateIdentifier(identifier);
    if (idError) return res.status(400).json({ error: idError });

    const user = await findUser(identifier);

    if (user) {
      const OTP = require('../utils/otp');
      const otpCode = OTP.generateCode();

      await Promise.all([
        OTP.save(identifier, otpCode, 'reset', user.id),
        OTP.send(identifier, otpCode, 'reset'),
      ]);
    }

    res.json({ message: 'If an account exists, a code has been sent' });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', otpRateLimiter, async (req, res, next) => {
  try {
    const { identifier, code, new_password } = req.body;

    if (!identifier || !code || !new_password) {
      return res.status(400).json({ error: 'Identifier, code, and new password are required' });
    }

    const idError = validateIdentifier(identifier);
    if (idError) return res.status(400).json({ error: idError });

    const codeError = validateOtpCode(code);
    if (codeError) return res.status(400).json({ error: codeError });

    const passError = validatePassword(new_password);
    if (passError) return res.status(400).json({ error: passError });

    const OTP = require('../utils/otp');
    const isValid = await OTP.verify(identifier, code, 'reset');

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    const passwordHash = await bcrypt.hash(new_password, BCRYPT_ROUNDS);
    await updatePassword(identifier, passwordHash);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token required' });
    }

    const jwt = require('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db.query(
      `SELECT id, full_name, email, phone, role, avatar_url,
              region, province, language_pref, cultural_background, voice_intro_url,
              interests, bio, clan, age, is_verified, onboarding_status, created_at
       FROM users WHERE id = $1`,
      [decoded.id]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const newUser = user.rows[0];
    const newToken = generateToken(newUser);

    res.json({
      user: formatUser(newUser),
      token: newToken,
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    next(err);
  }
});

module.exports = router;
