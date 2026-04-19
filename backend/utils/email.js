const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    // If no SMTP configured, log to console as fallback (so dev doesn't break)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('--- EMAIL NOT SENT: SMTP NOT CONFIGURED ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('-------------------------------------------');
      return false;
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Inkomoko" <no-reply@inkomoko.app>',
      to,
      subject,
      html,
    });

    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  transporter
};
