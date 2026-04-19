const express = require('express');
const db = require('../config/database');
const router = express.Router();

// 🚨 DANGER: This route wipes all user data for a clean start.
// In a real production app, this would be highly protected.
router.post('/wipe', async (req, res) => {
    try {
        console.log('--- NUCLEAR WIPE INITIATED ---');
        
        // Disable triggers/constraints temporarily if needed, 
        // but TRUNCATE CASCADE usually works best.
        const tables = [
            'otp_verifications',
            'comments',
            'play_history',
            'gratitudes',
            'bookmarks',
            'stories',
            'family_members',
            'families',
            'notifications',
            'user_settings',
            'users'
        ];

        for (const table of tables) {
            await db.query(`TRUNCATE ${table} CASCADE;`);
        }

        console.log('--- WIPE COMPLETE ---');
        res.json({ message: 'Database wiped successfully. You have a clean slate.' });
    } catch (err) {
        console.error('Wipe failed:', err);
        res.status(500).json({ error: 'Database wipe failed', details: err.message });
    }
});

module.exports = router;
