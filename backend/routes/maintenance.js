'use strict';

const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const WIPE_SECRET = process.env.WIPE_SECRET;

if (!WIPE_SECRET && process.env.NODE_ENV !== 'production') {
  console.warn('WARNING: WIPE_SECRET is not set. Maintenance wipe endpoint is disabled.');
}

router.post('/wipe', authenticateToken, async (req, res, next) => {
  try {
    if (!WIPE_SECRET) {
      return res.status(503).json({ error: 'Maintenance endpoint is disabled' });
    }

    const { secret } = req.body;

    if (secret !== WIPE_SECRET) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log('--- DATABASE WIPE INITIATED ---');

    const tables = [
      'otp_verifications',
      'comments',
      'play_history',
      'gratitudes',
      'bookmarks',
      'story_tags',
      'stories',
      'family_members',
      'families',
      'notifications',
      'user_settings',
      'followers',
      'users',
    ];

    for (const table of tables) {
      await db.query(`TRUNCATE ${table} CASCADE`);
    }

    console.log('--- DATABASE WIPE COMPLETE ---');

    res.json({ message: 'Database wiped successfully' });
  } catch (err) {
    console.error('Wipe failed:', err);
    next(err);
  }
});

module.exports = router;
