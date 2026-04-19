const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/families — Create family
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Family name required' });

    // Generate unique code
    const code = 'INKOMOKO-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    const result = await db.query(
      `INSERT INTO families (name, code, description, created_by) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, code, description, req.user.id]
    );

    // Add creator as admin
    await db.query(
      `INSERT INTO family_members (family_id, user_id, role, status) VALUES ($1, $2, 'admin', 'approved')`,
      [result.rows[0].id, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Family create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/families/join — Join family by code
router.post('/join', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Family code required' });

    const family = await db.query('SELECT * FROM families WHERE code = $1', [code]);
    if (family.rows.length === 0) {
      return res.status(404).json({ error: 'Family not found with that code' });
    }

    const existing = await db.query(
      'SELECT * FROM family_members WHERE family_id = $1 AND user_id = $2',
      [family.rows[0].id, req.user.id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Already a member or request pending' });
    }

    await db.query(
      `INSERT INTO family_members (family_id, user_id, role, status) VALUES ($1, $2, 'member', 'pending')`,
      [family.rows[0].id, req.user.id]
    );

    res.json({ message: 'Join request sent', family: family.rows[0] });
  } catch (err) {
    console.error('Family join error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/families/my — User's families
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT f.*, fm.role as my_role, fm.status as my_status,
              (SELECT COUNT(*) FROM family_members WHERE family_id = f.id AND status = 'approved') as member_count
       FROM families f
       JOIN family_members fm ON fm.family_id = f.id
       WHERE fm.user_id = $1 AND fm.status = 'approved'`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('My families error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/families/:id/members — Family members
router.get('/:id/members', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT fm.*, u.full_name, u.avatar_url, u.role as user_role, u.email
       FROM family_members fm
       JOIN users u ON u.id = fm.user_id
       WHERE fm.family_id = $1
       ORDER BY fm.role = 'admin' DESC, fm.joined_at ASC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Members error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/families/:id/pending — Pending requests
router.get('/:id/pending', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT fm.*, u.full_name, u.avatar_url, u.role as user_role
       FROM family_members fm
       JOIN users u ON u.id = fm.user_id
       WHERE fm.family_id = $1 AND fm.status = 'pending'
       ORDER BY fm.joined_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Pending error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/families/:familyId/members/:memberId — Update member role/status
router.put('/:familyId/members/:memberId', authenticateToken, async (req, res) => {
  try {
    const { role, status } = req.body;

    // Check requester is admin
    const admin = await db.query(
      `SELECT * FROM family_members WHERE family_id = $1 AND user_id = $2 AND role = 'admin' AND status = 'approved'`,
      [req.params.familyId, req.user.id]
    );
    if (admin.rows.length === 0) {
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
    console.error('Member update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/families/:familyId/approve/:memberId
router.post('/:familyId/approve/:memberId', authenticateToken, async (req, res) => {
  try {
    const admin = await db.query(
      `SELECT * FROM family_members WHERE family_id = $1 AND user_id = $2 AND role = 'admin' AND status = 'approved'`,
      [req.params.familyId, req.user.id]
    );
    if (admin.rows.length === 0) {
      return res.status(403).json({ error: 'Only admins can approve members' });
    }

    await db.query(
      `UPDATE family_members SET status = 'approved' WHERE id = $1 AND family_id = $2`,
      [req.params.memberId, req.params.familyId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/families/:familyId/reject/:memberId
router.post('/:familyId/reject/:memberId', authenticateToken, async (req, res) => {
  try {
    const admin = await db.query(
      `SELECT * FROM family_members WHERE family_id = $1 AND user_id = $2 AND role = 'admin' AND status = 'approved'`,
      [req.params.familyId, req.user.id]
    );
    if (admin.rows.length === 0) {
      return res.status(403).json({ error: 'Only admins can reject members' });
    }

    await db.query(
      `DELETE FROM family_members WHERE id = $1 AND family_id = $2`,
      [req.params.memberId, req.params.familyId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/families/:id/elders — Family elders
router.get('/:id/elders', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.full_name, u.avatar_url, u.bio,
              (SELECT COUNT(*) FROM stories WHERE author_id = u.id AND status = 'published') as story_count,
              (SELECT MAX(created_at) FROM stories WHERE author_id = u.id) as latest_story_at
       FROM users u
       JOIN family_members fm ON fm.user_id = u.id
       WHERE fm.family_id = $1 AND fm.status = 'approved' AND u.role = 'elder'
       ORDER BY latest_story_at DESC NULLS LAST`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Elders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
