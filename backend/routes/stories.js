'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { sanitize } = require('../utils/validation');
const { createIpRateLimiter } = require('../utils/rate-limiter');

const router = express.Router();

const ALLOWED_CATEGORIES = ['story', 'tradition', 'song', 'proverb', 'culture'];
const TITLE_MAX_LENGTH = 200;
const DESCRIPTION_MAX_LENGTH = 500;

const apiRateLimiter = createIpRateLimiter({ windowMs: 60 * 1000, max: 60 });

router.use(apiRateLimiter);

const ALLOWED_AUDIO_TYPES = ['.mp3', '.wav', '.ogg', '.m4a', '.webm', '.aac'];
const MAX_AUDIO_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 50 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'audio'));
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_AUDIO_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_AUDIO_TYPES.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid audio format. Allowed: ${ALLOWED_AUDIO_TYPES.join(', ')}`));
    }
  },
});

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      category,
      language,
      visibility,
      status,
      author_id,
      search,
      limit = 20,
      offset = 0,
    } = req.query;

    const whereClauses = ["s.status = 'published'"];
    const params = [];
    let paramIndex = 1;

    if (category) {
      whereClauses.push(`s.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (language) {
      whereClauses.push(`s.language = $${paramIndex}`);
      params.push(language);
      paramIndex++;
    }

    if (visibility) {
      whereClauses.push(`s.visibility = $${paramIndex}`);
      params.push(visibility);
      paramIndex++;
    }

    if (author_id) {
      whereClauses.push(`s.author_id = $${paramIndex}`);
      params.push(author_id);
      paramIndex++;
    }

    if (search) {
      whereClauses.push(`(s.title ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereClauses.join(' AND ');

    const [storiesResult, countResult] = await Promise.all([
      db.query(
        `SELECT s.*,
                u.full_name AS author_name,
                u.avatar_url AS author_avatar,
                u.clan AS author_clan
         FROM stories s
         JOIN users u ON u.id = s.author_id
         WHERE ${whereClause}
         ORDER BY s.created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, parseInt(limit, 10), parseInt(offset, 10)]
      ),
      db.query(
        `SELECT COUNT(*) FROM stories s WHERE ${whereClause}`,
        params
      ),
    ]);

    res.json({
      stories: storiesResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/trending', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT s.*,
              u.full_name AS author_name,
              u.avatar_url AS author_avatar
       FROM stories s
       JOIN users u ON u.id = s.author_id
       WHERE s.status = 'published' AND s.visibility = 'public'
       ORDER BY s.play_count DESC, s.gratitude_count DESC
       LIMIT 10`
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/drafts', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM stories
       WHERE author_id = $1 AND status = 'draft'
       ORDER BY updated_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/my', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM stories
       WHERE author_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/bookmarked', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT s.*,
              u.full_name AS author_name,
              u.avatar_url AS author_avatar
       FROM stories s
       JOIN bookmarks b ON b.story_id = s.id
       JOIN users u ON u.id = s.author_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/feed', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT s.*,
              u.full_name AS author_name,
              u.avatar_url AS author_avatar
       FROM stories s
       JOIN users u ON u.id = s.author_id
       WHERE s.status = 'published'
         AND (s.visibility = 'public'
              OR s.author_id IN (
                SELECT fm2.user_id
                FROM family_members fm1
                JOIN family_members fm2 ON fm2.family_id = fm1.family_id
                WHERE fm1.user_id = $1
                  AND fm1.status = 'approved'
                  AND fm2.status = 'approved'
              ))
       ORDER BY s.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const storyResult = await db.query(
      `SELECT s.*,
              u.full_name AS author_name,
              u.avatar_url AS author_avatar,
              u.bio AS author_bio,
              u.clan AS author_clan,
              u.age AS author_age,
              u.region AS author_region,
              u.province AS author_province,
              (SELECT COUNT(*) FROM stories WHERE author_id = u.id AND status = 'published') AS author_story_count
       FROM stories s
       JOIN users u ON u.id = s.author_id
       WHERE s.id = $1`,
      [req.params.id]
    );

    if (storyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const story = storyResult.rows[0];

    if (req.user) {
      const [bookmarkResult, gratitudeResult] = await Promise.all([
        db.query('SELECT id FROM bookmarks WHERE user_id = $1 AND story_id = $2', [req.user.id, req.params.id]),
        db.query('SELECT id FROM gratitudes WHERE user_id = $1 AND story_id = $2', [req.user.id, req.params.id]),
      ]);

      story.is_bookmarked = bookmarkResult.rows.length > 0;
      story.is_grateful = gratitudeResult.rows.length > 0;
    }

    const commentsResult = await db.query(
      `SELECT c.*,
              u.full_name AS author_name,
              u.avatar_url AS author_avatar
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.story_id = $1
       ORDER BY c.created_at DESC`,
      [req.params.id]
    );

    story.comments = commentsResult.rows;

    res.json(story);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { title, description, text_content, category, language, visibility, status, era, tags } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const cleanTitle = sanitize(title);

    if (cleanTitle.length > TITLE_MAX_LENGTH) {
      return res.status(400).json({ error: `Title must be under ${TITLE_MAX_LENGTH} characters` });
    }

    const cleanCategory = category || 'story';
    if (!ALLOWED_CATEGORIES.includes(cleanCategory)) {
      return res.status(400).json({ error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}` });
    }

    const cleanDescription = description ? sanitize(description) : null;
    if (cleanDescription && cleanDescription.length > DESCRIPTION_MAX_LENGTH) {
      return res.status(400).json({ error: `Description must be under ${DESCRIPTION_MAX_LENGTH} characters` });
    }

    const cleanTextContent = text_content ? sanitize(text_content) : null;

    const result = await db.query(
      `INSERT INTO stories (title, description, text_content, author_id, category, language, visibility, status, era)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        cleanTitle,
        cleanDescription,
        cleanTextContent,
        req.user.id,
        cleanCategory,
        language || 'kinyarwanda',
        visibility || 'public',
        status || 'draft',
        era || null,
      ]
    );

    const story = result.rows[0];

    if (tags && tags.length > 0) {
      const tagValues = tags.map((tag, idx) => `($1, $${idx + 2})`).join(', ');
      await db.query(
        `INSERT INTO story_tags (story_id, tag) VALUES ${tagValues} ON CONFLICT DO NOTHING`,
        [story.id, ...tags]
      );
    }

    res.status(201).json(story);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const {
      title,
      description,
      text_content,
      category,
      language,
      visibility,
      status,
      era,
      transcript_kinyarwanda,
      transcript_english,
    } = req.body;

    if (title !== undefined) {
      const cleanTitle = sanitize(title);
      if (cleanTitle.length === 0) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      if (cleanTitle.length > TITLE_MAX_LENGTH) {
        return res.status(400).json({ error: `Title must be under ${TITLE_MAX_LENGTH} characters` });
      }
    }

    if (category !== undefined && !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}` });
    }

    const cleanDescription = description !== undefined ? sanitize(description) : undefined;
    const cleanTextContent = text_content !== undefined ? sanitize(text_content) : undefined;

    const result = await db.query(
      `UPDATE stories SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         text_content = COALESCE($3, text_content),
         category = COALESCE($4, category),
         language = COALESCE($5, language),
         visibility = COALESCE($6, visibility),
         status = COALESCE($7, status),
         era = COALESCE($8, era),
         transcript_kinyarwanda = COALESCE($9, transcript_kinyarwanda),
         transcript_english = COALESCE($10, transcript_english)
       WHERE id = $11 AND author_id = $12
       RETURNING *`,
      [
        title !== undefined ? sanitize(title) : undefined,
        cleanDescription,
        cleanTextContent,
        category,
        language,
        visibility,
        status,
        era,
        transcript_kinyarwanda,
        transcript_english,
        req.params.id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Story not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/audio', authenticateToken, upload.single('audio'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioUrl = `/uploads/audio/${req.file.filename}`;
    const duration = parseInt(req.body.duration, 10) || 0;

    const result = await db.query(
      `UPDATE stories SET audio_url = $1, duration_seconds = $2
       WHERE id = $3 AND author_id = $4
       RETURNING *`,
      [audioUrl, duration, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Story not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large' });
    }
    if (err.message && err.message.startsWith('Invalid audio format')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

router.post('/:id/gratitude', authenticateToken, async (req, res, next) => {
  try {
    const existing = await db.query(
      'SELECT id FROM gratitudes WHERE user_id = $1 AND story_id = $2',
      [req.user.id, req.params.id]
    );

    if (existing.rows.length > 0) {
      await db.query('DELETE FROM gratitudes WHERE user_id = $1 AND story_id = $2', [req.user.id, req.params.id]);
      await db.query(
        'UPDATE stories SET gratitude_count = GREATEST(0, gratitude_count - 1) WHERE id = $1',
        [req.params.id]
      );
      return res.json({ grateful: false });
    }

    await db.query('INSERT INTO gratitudes (user_id, story_id) VALUES ($1, $2)', [req.user.id, req.params.id]);
    await db.query('UPDATE stories SET gratitude_count = gratitude_count + 1 WHERE id = $1', [req.params.id]);

    res.json({ grateful: true });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/bookmark', authenticateToken, async (req, res, next) => {
  try {
    const existing = await db.query(
      'SELECT id FROM bookmarks WHERE user_id = $1 AND story_id = $2',
      [req.user.id, req.params.id]
    );

    if (existing.rows.length > 0) {
      await db.query('DELETE FROM bookmarks WHERE user_id = $1 AND story_id = $2', [req.user.id, req.params.id]);
      return res.json({ bookmarked: false });
    }

    await db.query('INSERT INTO bookmarks (user_id, story_id) VALUES ($1, $2)', [req.user.id, req.params.id]);

    res.json({ bookmarked: true });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/play', optionalAuth, async (req, res, next) => {
  try {
    const { progress_seconds, completed } = req.body;

    await db.query('UPDATE stories SET play_count = play_count + 1 WHERE id = $1', [req.params.id]);

    if (req.user) {
      await db.query(
        'INSERT INTO play_history (user_id, story_id, progress_seconds, completed) VALUES ($1, $2, $3, $4)',
        [req.user.id, req.params.id, progress_seconds || 0, completed || false]
      );
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/comments', authenticateToken, async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const result = await db.query(
      'INSERT INTO comments (story_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, req.user.id, content.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      'DELETE FROM stories WHERE id = $1 AND author_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Story not found or unauthorized' });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
