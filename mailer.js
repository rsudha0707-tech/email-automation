const nodemailer = require('nodemailer');
const config = require('./config');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465, // true for 465, false for other ports
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

/**
 * Sends the newsletter to all recipients.
 */
async function sendNewsletter() {
  console.log('--- Starting Email Workflow ---');
  console.log(`Time: ${new Date().toLocaleString()}`);
  
  if (!config.smtp.user || !config.smtp.pass) {
    console.error('Error: SMTP credentials not configured in .env');
    return;
  }

  const mailOptions = {
    from: config.smtp.user,
    to: config.email.recipients.join(', '), // Sending to all at once
    subject: config.email.subject,
    text: config.email.message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Recipients:', config.email.recipients.join(', '));
  } catch (error) {
    console.error('Failed to send email:', error.message);
  }
  console.log('--- Workflow Complete ---');
}

module.exports = { sendNewsletter };
