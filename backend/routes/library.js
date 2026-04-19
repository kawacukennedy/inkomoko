const express = require('express');
const db = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/library/featured
router.get('/featured', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, u.full_name as author_name, u.avatar_url as author_avatar
       FROM stories s
       JOIN users u ON u.id = s.author_id
       WHERE s.status = 'published' AND s.visibility = 'public'
       ORDER BY s.gratitude_count DESC, s.play_count DESC
       LIMIT 1`
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error('Featured error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/library/near-me
router.get('/near-me', optionalAuth, async (req, res) => {
  try {
    const region = req.query.region || 'Northern Province';
    const result = await db.query(
      `SELECT s.*, u.full_name as author_name, u.avatar_url as author_avatar, u.region as author_region
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
    console.error('Near me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/library/archive — Curated bento grid
router.get('/archive', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, u.full_name as author_name, u.avatar_url as author_avatar
       FROM stories s
       JOIN users u ON u.id = s.author_id
       WHERE s.status = 'published' AND s.visibility = 'public'
       ORDER BY s.gratitude_count DESC
       LIMIT 12`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Archive error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/library/categories
router.get('/categories', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT category, COUNT(*) as count
       FROM stories
       WHERE status = 'published' AND visibility = 'public'
       GROUP BY category
       ORDER BY count DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Categories error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/library/stats
router.get('/stats', async (req, res) => {
  try {
    const stories = await db.query("SELECT COUNT(*) FROM stories WHERE status = 'published'");
    const elders = await db.query("SELECT COUNT(*) FROM users WHERE role = 'elder'");
    const plays = await db.query("SELECT COALESCE(SUM(play_count), 0) as total FROM stories");
    res.json({
      total_stories: parseInt(stories.rows[0].count),
      total_elders: parseInt(elders.rows[0].count),
      total_plays: parseInt(plays.rows[0].total)
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
