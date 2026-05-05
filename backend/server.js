'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');

// Use mock database if no DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.log('Using in-memory mock database (no DATABASE_URL set)');
}

const { ensureUploadDirs } = require('./utils/storage');
const { errorHandler, notFoundHandler } = require('./middleware/error');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directories exist
ensureUploadDirs();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Performance middleware
app.use(compression());

// Body parsing middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  etag: true,
}));

app.use(express.static(path.join(__dirname, '..', 'frontend'), {
  maxAge: '1d',
  etag: true,
}));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/families', require('./routes/families'));
app.use('/api/library', require('./routes/library'));
app.use('/api/dashboard', require('./routes/dashboard'));

if (process.env.GEMINI_API_KEY) {
  app.use('/api/ai', require('./routes/ai'));
}

if (process.env.NODE_ENV !== 'production') {
  app.use('/api/maintenance', require('./routes/maintenance'));
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// SPA fallback - serve frontend for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Inkomoko API running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
