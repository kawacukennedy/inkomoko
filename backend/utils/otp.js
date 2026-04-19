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

  // Send real email OTP
  async send(identifier, code, purpose = 'login') {
    const { sendEmail } = require('./email');
    const otpTemplate = require('../templates/otp-template');

    // Only send if it's an email identifier
    if (identifier.includes('@')) {
      const html = otpTemplate(code, purpose);
      const subject = purpose === 'signup' ? 'Welcome to Inkomoko — Verify Your Account' : 'Inkomoko Verification Code';
      await sendEmail(identifier, subject, html);
    } else {
      // Fallback for SMS if needed later
      console.log(`\n==========================================`);
      console.log(`[PHONE OTP SENT] To: ${identifier}`);
      console.log(`[CODE]: ${code}`);
      console.log(`==========================================\n`);
    }
  }
};

module.exports = OTP;
