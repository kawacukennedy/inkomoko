'use strict';

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.get('/elder', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [storiesResult, listenersResult, playsResult] = await Promise.all([
      db.query(
        "SELECT COUNT(*) FROM stories WHERE author_id = $1 AND status = 'published'",
        [userId]
      ),
      db.query(
        `SELECT COUNT(DISTINCT ph.user_id)
         FROM play_history ph
         JOIN stories s ON s.id = ph.story_id
         WHERE s.author_id = $1`,
        [userId]
      ),
      db.query(
        "SELECT COALESCE(SUM(play_count), 0) as total FROM stories WHERE author_id = $1",
        [userId]
      ),
    ]);

    res.json({
      stories_shared: parseInt(storiesResult.rows[0].count, 10),
      family_listeners: parseInt(listenersResult.rows[0].count, 10),
      total_plays: parseInt(playsResult.rows[0].total, 10),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
