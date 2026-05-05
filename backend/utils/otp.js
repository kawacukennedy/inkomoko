'use strict';

const crypto = require('crypto');
const db = require('../config/database');

const OTP_EXPIRY_MINUTES = 10;

function generateCode() {
  return crypto.randomInt(100000, 999999).toString();
}

async function save(identifier, code, purpose) {
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.query(
    'INSERT INTO otp_verifications (identifier, otp_code, purpose, expires_at) VALUES ($1, $2, $3, $4)',
    [identifier, code, purpose, expiresAt]
  );
}

async function verify(identifier, code, purpose) {
  const result = await db.query(
    `SELECT id FROM otp_verifications
     WHERE identifier = $1
       AND otp_code = $2
       AND purpose = $3
       AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [identifier, code, purpose]
  );

  if (result.rows.length > 0) {
    await db.query(
      'DELETE FROM otp_verifications WHERE identifier = $1 AND purpose = $2',
      [identifier, purpose]
    );
    return true;
  }

  return false;
}

async function send(identifier, code, purpose = 'login') {
  const { sendEmail } = require('./email');
  const otpTemplate = require('../templates/otp-template');

  if (identifier.includes('@')) {
    const html = otpTemplate(code, purpose);
    const subject = purpose === 'signup'
      ? 'Welcome to Inkomoko - Verify Your Account'
      : purpose === 'reset'
        ? 'Inkomoko Password Reset'
        : 'Inkomoko Verification Code';

    const sent = await sendEmail(identifier, subject, html);

    if (!sent) {
      console.log(`[DEV MODE] OTP for ${identifier}: ${code}`);
    }

    return true;
  }

  console.log(`\n==========================================`);
  console.log(`[PHONE OTP] To: ${identifier}`);
  console.log(`[CODE]: ${code}`);
  console.log(`==========================================\n`);

  return true;
}

module.exports = { generateCode, save, verify, send };
