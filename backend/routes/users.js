'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { createIpRateLimiter } = require('../utils/rate-limiter');

const router = express.Router();

const apiRateLimiter = createIpRateLimiter({ windowMs: 60 * 1000, max: 60 });

router.use(apiRateLimiter);

const avatarStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads', 'avatars'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomUUID() + ext;
    cb(null, name);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(null, ext);
  },
});

router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, full_name, email, phone, role, avatar_url, region, province,
              language_pref, cultural_background, voice_intro_url, interests,
              bio, clan, age, onboarding_status, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { full_name, region, province, language_pref, cultural_background, bio, clan, age } = req.body;

    const result = await db.query(
      `UPDATE users SET
         full_name = COALESCE($1, full_name),
         region = COALESCE($2, region),
         province = COALESCE($3, province),
         language_pref = COALESCE($4, language_pref),
         cultural_background = COALESCE($5, cultural_background),
         bio = COALESCE($6, bio),
         clan = COALESCE($7, clan),
         age = COALESCE($8, age)
       WHERE id = $9
       RETURNING id, full_name, email, phone, role, avatar_url, region, province,
                 language_pref, cultural_background, bio, clan, age, onboarding_status`,
      [full_name, region, province, language_pref, cultural_background, bio, clan, age, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/onboarding', authenticateToken, async (req, res, next) => {
  try {
    const { full_name, role, region, province, language_pref, cultural_background, interests } = req.body;

    const result = await db.query(
      `UPDATE users SET
         full_name = COALESCE($1, full_name),
         role = COALESCE($2, role),
         region = COALESCE($3, region),
         province = COALESCE($4, province),
         language_pref = COALESCE($5, language_pref),
         cultural_background = COALESCE($6, cultural_background),
         interests = COALESCE($7, interests),
         onboarding_status = TRUE
       WHERE id = $8
       RETURNING *`,
      [full_name, role, region, province, language_pref, cultural_background, interests, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    delete user.password_hash;

    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.put('/avatar', authenticateToken, avatarUpload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const result = await db.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, avatar_url',
      [avatarUrl, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ avatar_url: avatarUrl });
  } catch (err) {
    next(err);
  }
});

router.get('/settings', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT us.*, u.full_name, u.email, u.phone, u.language_pref
       FROM user_settings us
       JOIN users u ON u.id = us.user_id
       WHERE us.user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/settings', authenticateToken, async (req, res, next) => {
  try {
    const { daily_remembrances, family_tree_updates, listening_history_visible, family_tree_visible, language_pref } = req.body;

    if (language_pref) {
      await db.query('UPDATE users SET language_pref = $1 WHERE id = $2', [language_pref, req.user.id]);
    }

    const result = await db.query(
      `UPDATE user_settings SET
         daily_remembrances = COALESCE($1, daily_remembrances),
         family_tree_updates = COALESCE($2, family_tree_updates),
         listening_history_visible = COALESCE($3, listening_history_visible),
         family_tree_visible = COALESCE($4, family_tree_visible)
       WHERE user_id = $5
       RETURNING *`,
      [daily_remembrances, family_tree_updates, listening_history_visible, family_tree_visible, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.full_name, u.role, u.avatar_url, u.region, u.province,
              u.bio, u.clan, u.age, u.created_at,
              COUNT(DISTINCT s.id) AS story_count,
              COALESCE(SUM(s.play_count), 0) AS total_plays,
              COUNT(DISTINCT f.follower_id) AS follower_count
       FROM users u
       LEFT JOIN stories s ON s.author_id = u.id AND s.status = 'published'
       LEFT JOIN followers f ON f.followed_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/follow', authenticateToken, async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    await db.query(
      `INSERT INTO followers (follower_id, followed_id)
       VALUES ($1, $2)
       ON CONFLICT (follower_id, followed_id) DO NOTHING`,
      [req.user.id, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/follow', authenticateToken, async (req, res, next) => {
  try {
    await db.query(
      'DELETE FROM followers WHERE follower_id = $1 AND followed_id = $2',
      [req.user.id, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
