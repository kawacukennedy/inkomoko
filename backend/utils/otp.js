const db = require('../config/database');
const crypto = require('crypto');

const OTP = {
  // Generate 6-digit OTP
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Save OTP to database
  async save(identifier, code, purpose) {
    const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await db.query(
      'INSERT INTO otp_verifications (identifier, otp_code, purpose, expires_at) VALUES ($1, $2, $3, $4)',
      [identifier, code, purpose, expires_at]
    );
  },

  // Verify OTP
  async verify(identifier, code, purpose) {
    const result = await db.query(
      'SELECT id FROM otp_verifications WHERE identifier = $1 AND otp_code = $2 AND purpose = $3 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [identifier, code, purpose]
    );

    if (result.rows.length > 0) {
      // Delete used OTP
      await db.query('DELETE FROM otp_verifications WHERE identifier = $1 AND purpose = $2', [identifier, purpose]);
      return true;
    }
    return false;
  },

  // Mock send OTP
  async send(identifier, code) {
    console.log(`\n==========================================`);
    console.log(`[OTP SENT] To: ${identifier}`);
    console.log(`[CODE]: ${code}`);
    console.log(`==========================================\n`);
  }
};

module.exports = OTP;
