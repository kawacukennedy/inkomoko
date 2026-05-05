'use strict';

const crypto = require('crypto');
const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { createIpRateLimiter } = require('../utils/rate-limiter');

const router = express.Router();

const apiRateLimiter = createIpRateLimiter({ windowMs: 60 * 1000, max: 60 });

router.use(apiRateLimiter);

function generateFamilyCode() {
  const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `INKOMOKO-${randomPart}`;
}

async function isAdmin(familyId, userId) {
  const result = await db.query(
    `SELECT id FROM family_members
     WHERE family_id = $1 AND user_id = $2 AND role = 'admin' AND status = 'approved'`,
    [familyId, userId]
  );
  return result.rows.length > 0;
}

router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Family name is required' });
    }

    const code = generateFamilyCode();

    const familyResult = await db.query(
      'INSERT INTO families (name, code, description, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [name.trim(), code, description || null, req.user.id]
    );

    const family = familyResult.rows[0];

    await db.query(
      'INSERT INTO family_members (family_id, user_id, role, status) VALUES ($1, $2, $3, $4)',
      [family.id, req.user.id, 'admin', 'approved']
    );

    res.status(201).json(family);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Family code collision, please try again' });
    }
    next(err);
  }
});

router.post('/join', authenticateToken, async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code || code.trim().length === 0) {
      return res.status(400).json({ error: 'Family code is required' });
    }

    const familyResult = await db.query('SELECT * FROM families WHERE code = $1', [code.trim().toUpperCase()]);

    if (familyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const family = familyResult.rows[0];

    const existingResult = await db.query(
      'SELECT id, status FROM family_members WHERE family_id = $1 AND user_id = $2',
      [family.id, req.user.id]
    );

    if (existingResult.rows.length > 0) {
      const membership = existingResult.rows[0];
      if (membership.status === 'approved') {
        return res.status(409).json({ error: 'You are already a member' });
      }
      return res.status(409).json({ error: 'Join request already pending' });
    }

    await db.query(
      'INSERT INTO family_members (family_id, user_id, role, status) VALUES ($1, $2, $3, $4)',
      [family.id, req.user.id, 'member', 'pending']
    );

    res.json({
      message: 'Join request sent',
      family,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/my', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT f.*,
              fm.role AS my_role,
              fm.status AS my_status,
              (SELECT COUNT(*) FROM family_members WHERE family_id = f.id AND status = 'approved') AS member_count
       FROM families f
       JOIN family_members fm ON fm.family_id = f.id
       WHERE fm.user_id = $1 AND fm.status = 'approved'`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/members', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT fm.*,
              u.full_name,
              u.avatar_url,
              u.role AS user_role,
              u.email
       FROM family_members fm
       JOIN users u ON u.id = fm.user_id
       WHERE fm.family_id = $1
       ORDER BY CASE fm.role WHEN 'admin' THEN 0 ELSE 1 END, fm.joined_at ASC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/pending', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT fm.*,
              u.full_name,
              u.avatar_url,
              u.role AS user_role
       FROM family_members fm
       JOIN users u ON u.id = fm.user_id
       WHERE fm.family_id = $1 AND fm.status = 'pending'
       ORDER BY fm.joined_at DESC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.put('/:familyId/members/:memberId', authenticateToken, async (req, res, next) => {
  try {
    const { role, status } = req.body;

    const isUserAdmin = await isAdmin(req.params.familyId, req.user.id);

    if (!isUserAdmin) {
      return res.status(403).json({ error: 'Only admins can manage members' });
    }

    const result = await db.query(
      `UPDATE family_members SET
         role = COALESCE($1, role),
         status = COALESCE($2, status)
       WHERE id = $3 AND family_id = $4
       RETURNING *`,
      [role, status, req.params.memberId, req.params.familyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/:familyId/approve/:memberId', authenticateToken, async (req, res, next) => {
  try {
    const isUserAdmin = await isAdmin(req.params.familyId, req.user.id);

    if (!isUserAdmin) {
      return res.status(403).json({ error: 'Only admins can approve members' });
    }

    await db.query(
      'UPDATE family_members SET status = $1 WHERE id = $2 AND family_id = $3',
      ['approved', req.params.memberId, req.params.familyId]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/:familyId/reject/:memberId', authenticateToken, async (req, res, next) => {
  try {
    const isUserAdmin = await isAdmin(req.params.familyId, req.user.id);

    if (!isUserAdmin) {
      return res.status(403).json({ error: 'Only admins can reject members' });
    }

    await db.query(
      'DELETE FROM family_members WHERE id = $1 AND family_id = $2',
      [req.params.memberId, req.params.familyId]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/elders', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT u.id,
              u.full_name,
              u.avatar_url,
              u.bio,
              (SELECT COUNT(*) FROM stories WHERE author_id = u.id AND status = 'published') AS story_count,
              (SELECT MAX(created_at) FROM stories WHERE author_id = u.id) AS latest_story_at
       FROM users u
       JOIN family_members fm ON fm.user_id = u.id
       WHERE fm.family_id = $1 AND fm.status = 'approved' AND u.role = 'elder'
       ORDER BY latest_story_at DESC NULLS LAST`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
