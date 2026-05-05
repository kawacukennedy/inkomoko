'use strict';

const express = require('express');
const db = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/featured', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT s.*,
              u.full_name AS author_name,
              u.avatar_url AS author_avatar
       FROM stories s
       JOIN users u ON u.id = s.author_id
       WHERE s.status = 'published' AND s.visibility = 'public'
       ORDER BY s.gratitude_count DESC, s.play_count DESC
       LIMIT 1`
    );

    res.json(result.rows[0] || null);
  } catch (err) {
    next(err);
  }
});

router.get('/near-me', optionalAuth, async (req, res, next) => {
  try {
    const region = req.query.region || 'Northern Province';

    const result = await db.query(
      `SELECT s.*,
              u.full_name AS author_name,
              u.avatar_url AS author_avatar,
              u.region AS author_region
       FROM stories s
       JOIN users u ON u.id = s.author_id
       WHERE s.status = 'published' AND s.visibility = 'public'
         AND u.region = $1
       ORDER BY s.created_at DESC
       LIMIT 6`,
      [region]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/archive', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT s.*,
              u.full_name AS author_name,
              u.avatar_url AS author_avatar
       FROM stories s
       JOIN users u ON u.id = s.author_id
       WHERE s.status = 'published' AND s.visibility = 'public'
       ORDER BY s.gratitude_count DESC
       LIMIT 12`
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT category, COUNT(*) AS count
       FROM stories
       WHERE status = 'published' AND visibility = 'public'
       GROUP BY category
       ORDER BY count DESC`
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const [storiesResult, eldersResult, playsResult] = await Promise.all([
      db.query("SELECT COUNT(*) FROM stories WHERE status = 'published'"),
      db.query("SELECT COUNT(*) FROM users WHERE role = 'elder'"),
      db.query('SELECT COALESCE(SUM(play_count), 0) AS total FROM stories'),
    ]);

    res.json({
      total_stories: parseInt(storiesResult.rows[0].count, 10),
      total_elders: parseInt(eldersResult.rows[0].count, 10),
      total_plays: parseInt(playsResult.rows[0].total, 10),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
