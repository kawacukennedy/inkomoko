'use strict';

const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return null;
    }

    const port = parseInt(process.env.SMTP_PORT, 10) || 465; // Default to 465 for cloud compatibility
    const isSecure = port === 465;

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: isSecure, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

async function sendEmail(to, subject, html) {
  const mailer = getTransporter();

  if (!mailer) {
    console.log(`[EMAIL SIMULATED] To: ${to} | Subject: ${subject}`);
    return false;
  }

  try {
    // Verify connection configuration before sending
    await mailer.verify();
    
    const info = await Promise.race([
      mailer.sendMail({
        from: process.env.EMAIL_FROM || '"Inkomoko" <no-reply@inkomoko.app>',
        to,
        subject,
        html,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email send timeout')), 8000)
      ),
    ]);

    console.log(`[EMAIL SUCCESS] Message sent: ${info.messageId} to ${to}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL FAILED] To: ${to} | Error: ${error.message}`);
    if (error.code === 'ENETUNREACH' || error.message.includes('timeout')) {
       console.error('[EMAIL TROUBLESHOOT] If on Render, ensure SMTP_PORT is set to 465. Port 587 is blocked.');
    }
    return false;
  }
}

module.exports = { sendEmail };
