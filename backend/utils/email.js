'use strict';

const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return null;
    }

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
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
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"Inkomoko" <no-reply@inkomoko.app>',
      to,
      subject,
      html,
    });

    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Email send failed:', error.message);
    return false;
  }
}

module.exports = { sendEmail };
