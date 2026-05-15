require('dotenv').config();

module.exports = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  email: {
    subject: process.env.EMAIL_SUBJECT || 'Weekly Newsletter',
    message: process.env.EMAIL_MESSAGE || "Hello everyone! Here's your weekly update.",
    recipients: (process.env.RECIPIENTS || '').split(',').map(email => email.trim()),
  },
};
