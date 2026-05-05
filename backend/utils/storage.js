'use strict';

const path = require('path');
const fs = require('fs');

const UPLOAD_DIRS = [
  'uploads',
  'uploads/audio',
  'uploads/avatars',
  'uploads/covers',
];

function ensureUploadDirs() {
  UPLOAD_DIRS.forEach((dir) => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
}

module.exports = { ensureUploadDirs };
