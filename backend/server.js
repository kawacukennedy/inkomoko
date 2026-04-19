require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Create upload directories
const uploadDirs = ['uploads', 'uploads/audio', 'uploads/avatars', 'uploads/covers'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression()); // Gzip for low bandwidth
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  etag: true
}));

// Serve frontend
app.use(express.static(path.join(__dirname, '..', 'frontend'), {
  maxAge: '1d',
  etag: true
}));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/families', require('./routes/families'));
app.use('/api/library', require('./routes/library'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/maintenance', require('./routes/maintenance'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dashboard stats for authenticated users
app.get('/api/dashboard/elder', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const db = require('./config/database');
    const stories = await db.query(
      "SELECT COUNT(*) FROM stories WHERE author_id = $1 AND status = 'published'",
      [req.user.id]
    );
    const listeners = await db.query(
      `SELECT COUNT(DISTINCT ph.user_id) FROM play_history ph
       JOIN stories s ON s.id = ph.story_id
       WHERE s.author_id = $1`,
      [req.user.id]
    );
    const plays = await db.query(
      "SELECT COALESCE(SUM(play_count), 0) as total FROM stories WHERE author_id = $1",
      [req.user.id]
    );
    res.json({
      stories_shared: parseInt(stories.rows[0].count),
      family_listeners: parseInt(listeners.rows[0].count),
      total_plays: parseInt(plays.rows[0].total)
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Catch-all: serve frontend index
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🔥 The Living Archive API running on http://localhost:${PORT}`);
  console.log(`📚 Frontend served from ../frontend\n`);
});

module.exports = app;
