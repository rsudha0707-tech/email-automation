const cron = require('node-cron');
const { sendNewsletter } = require('./mailer');

// Schedule: Every Monday at 9:00 AM
// Cron syntax: minute hour day-of-month month day-of-week
const schedule = '0 9 * * 1';

console.log('Email Automation Workflow initialized.');
console.log(`Newsletter scheduled for: Every Monday at 9:00 AM (${schedule})`);

// Schedule the task
const task = cron.schedule(schedule, () => {
  console.log('Executing scheduled newsletter task...');
  sendNewsletter();
}, {
  scheduled: true,
  timezone: "UTC" // You can change this to your local timezone, e.g., "Asia/Kolkata"
});

// Start the task
task.start();

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down scheduler...');
  task.stop();
  process.exit();
});

// For immediate testing purposes, you can uncomment the line below:
sendNewsletter();
