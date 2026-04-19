const express = require('express');
const db = require('../config/database');
const router = express.Router();

// PROTECTED Maintenance Wipe (Dangerous!)
router.post('/wipe', async (req, res) => {
    try {
        console.log('MAINTENANCE: Full Database Wipe Initiated');
        
        const tables = [
            'users', 'families', 'family_members', 'stories', 
            'bookmarks', 'gratitudes', 'comments', 'play_history', 
            'notifications', 'user_settings', 'otp_verifications'
        ];

        for (const table of tables) {
            await db.query(`TRUNCATE ${table} CASCADE;`);
        }

        console.log('MAINTENANCE: Wipe Complete');
        res.json({ message: 'Database wiped successfully. Clean start initiated.' });
    } catch (err) {
        console.error('MAINTENANCE ERROR:', err);
        res.status(500).json({ error: 'Wipe failed', details: err.message });
    }
});

module.exports = router;
