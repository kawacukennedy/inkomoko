const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Audio file upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'audio')),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3', '.wav', '.ogg', '.m4a', '.webm', '.aac'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Invalid audio format'));
  }
});

// GET /api/stories — List stories (with filters)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, language, visibility, status, author_id, search, limit = 20, offset = 0 } = req.query;
    let where = ['s.status = $1'];
    let params = ['published'];
    let paramIndex = 2;

    if (category) { where.push(`s.category = $${paramIndex}`); params.push(category); paramIndex++; }
    if (language) { where.push(`s.language = $${paramIndex}`); params.push(language); paramIndex++; }
    if (visibility) { where.push(`s.visibility = $${paramIndex}`); params.push(visibility); paramIndex++; }
    if (author_id) { where.push(`s.author_id = $${paramIndex}`); params.push(author_id); paramIndex++; }
    if (search) {
      where.push(`(s.title ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const result = await db.query(
      `SELECT s.*, u.full_name as author_name, u.avatar_url as author_avatar, u.clan as author_clan
       FROM stories s
       JOIN users u ON u.id = s.author_id
       WHERE ${where.join(' AND ')}
       ORDER BY s.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const countResult = await db.query(
      `SELECT COUNT(*) FROM stories s WHERE ${where.join(' AND ')}`,
      params
    );

    res.json({
      stories: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    console.error('Stories list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/stories/trending — Most popular stories
router.get('/trending', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, u.full_name as author_name, u.avatar_url as author_avatar
       FROM stories s
       JOIN users u ON u.id = s.author_id
       WHERE s.status = 'published' AND s.visibility = 'public'
       ORDER BY s.play_count DESC, s.gratitude_count DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Trending error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/stories/drafts — User's draft stories
router.get('/drafts', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM stories WHERE author_id = $1 AND status = 'draft' ORDER BY updated_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Drafts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/stories/my — User's stories (all statuses)
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM stories WHERE author_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('My stories error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/stories/bookmarked
router.get('/bookmarked', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, u.full_name as author_name, u.avatar_url as author_avatar
       FROM stories s
       JOIN bookmarks b ON b.story_id = s.id
       JOIN users u ON u.id = s.author_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Bookmarks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/stories/feed — Stories from family elders
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, u.full_name as author_name, u.avatar_url as author_avatar
       FROM stories s
       JOIN users u ON u.id = s.author_id
       WHERE s.status = 'published'
         AND (s.visibility = 'public'
              OR s.author_id IN (
                SELECT fm2.user_id FROM family_members fm1
                JOIN family_members fm2 ON fm2.family_id = fm1.family_id
                WHERE fm1.user_id = $1 AND fm1.status = 'approved' AND fm2.status = 'approved'
              ))
       ORDER BY s.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/stories/:id — Story detail
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, u.full_name as author_name, u.avatar_url as author_avatar,
              u.bio as author_bio, u.clan as author_clan, u.age as author_age,
              u.region as author_region, u.province as author_province,
              (SELECT COUNT(*) FROM stories WHERE author_id = u.id AND status = 'published') as author_story_count
       FROM stories s
       JOIN users u ON u.id = s.author_id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const story = result.rows[0];

    // Check bookmark & gratitude status for logged-in users
    if (req.user) {
      const bookmark = await db.query('SELECT id FROM bookmarks WHERE user_id = $1 AND story_id = $2', [req.user.id, req.params.id]);
      const gratitude = await db.query('SELECT id FROM gratitudes WHERE user_id = $1 AND story_id = $2', [req.user.id, req.params.id]);
      story.is_bookmarked = bookmark.rows.length > 0;
      story.is_grateful = gratitude.rows.length > 0;
    }

    // Get comments
    const comments = await db.query(
      `SELECT c.*, u.full_name as author_name, u.avatar_url as author_avatar
       FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.story_id = $1 ORDER BY c.created_at DESC`,
      [req.params.id]
    );
    story.comments = comments.rows;

    res.json(story);
  } catch (err) {
    console.error('Story detail error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/stories — Create story
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, text_content, category, language, visibility, status, era, tags } = req.body;

    const result = await db.query(
      `INSERT INTO stories (title, description, text_content, author_id, category, language, visibility, status, era)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description, text_content, req.user.id, category || 'story', language || 'kinyarwanda',
       visibility || 'public', status || 'draft', era]
    );

    const story = result.rows[0];

    // Add tags
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await db.query('INSERT INTO story_tags (story_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING', [story.id, tag]);
      }
    }

    res.status(201).json(story);
  } catch (err) {
    console.error('Story create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/stories/:id — Update story
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, text_content, category, language, visibility, status, era,
            transcript_kinyarwanda, transcript_english } = req.body;

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
      [title, description, text_content, category, language, visibility, status, era,
       transcript_kinyarwanda, transcript_english, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Story not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Story update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/stories/:id/audio — Upload audio for story
router.post('/:id/audio', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioUrl = `/uploads/audio/${req.file.filename}`;
    const result = await db.query(
      `UPDATE stories SET audio_url = $1, duration_seconds = COALESCE($2, duration_seconds)
       WHERE id = $3 AND author_id = $4
       RETURNING *`,
      [audioUrl, req.body.duration || 0, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Story not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Audio upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/stories/:id/gratitude
router.post('/:id/gratitude', authenticateToken, async (req, res) => {
  try {
    const existing = await db.query('SELECT id FROM gratitudes WHERE user_id = $1 AND story_id = $2', [req.user.id, req.params.id]);
    if (existing.rows.length > 0) {
      await db.query('DELETE FROM gratitudes WHERE user_id = $1 AND story_id = $2', [req.user.id, req.params.id]);
      await db.query('UPDATE stories SET gratitude_count = GREATEST(0, gratitude_count - 1) WHERE id = $1', [req.params.id]);
      return res.json({ grateful: false });
    }
    await db.query('INSERT INTO gratitudes (user_id, story_id) VALUES ($1, $2)', [req.user.id, req.params.id]);
    await db.query('UPDATE stories SET gratitude_count = gratitude_count + 1 WHERE id = $1', [req.params.id]);
    res.json({ grateful: true });
  } catch (err) {
    console.error('Gratitude error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/stories/:id/bookmark
router.post('/:id/bookmark', authenticateToken, async (req, res) => {
  try {
    const existing = await db.query('SELECT id FROM bookmarks WHERE user_id = $1 AND story_id = $2', [req.user.id, req.params.id]);
    if (existing.rows.length > 0) {
      await db.query('DELETE FROM bookmarks WHERE user_id = $1 AND story_id = $2', [req.user.id, req.params.id]);
      return res.json({ bookmarked: false });
    }
    await db.query('INSERT INTO bookmarks (user_id, story_id) VALUES ($1, $2)', [req.user.id, req.params.id]);
    res.json({ bookmarked: true });
  } catch (err) {
    console.error('Bookmark error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/stories/:id/play — Record play
router.post('/:id/play', optionalAuth, async (req, res) => {
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
    console.error('Play record error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/stories/:id/comments
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Comment content required' });

    const result = await db.query(
      `INSERT INTO comments (story_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.id, req.user.id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/stories/:id
router.delete('/:id', authenticateToken, async (req, res) => {
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
    console.error('Story delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
