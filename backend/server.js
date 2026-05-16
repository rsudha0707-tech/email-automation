require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const nodemailer = require('nodemailer');
const xlsx = require('xlsx');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURATION ---
const PORT = process.env.PORT || 5001;
const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_URL.startsWith('http')) 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;
const upload = multer({ dest: 'uploads/' });

// Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// --- HELPER FUNCTIONS ---

const extractEmailsFromText = (text) => {
  console.log(`Extracting emails from text of length: ${text.length}`);
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  return text.match(emailRegex) || [];
};

// --- ENDPOINTS ---

// 1. File Upload & Extraction
app.post('/api/extract', upload.array('files'), async (req, res) => {
  console.log(`Received ${req.files ? req.files.length : 0} files for extraction`);
  try {
    let allEmails = [];
    
    for (const file of req.files) {
      console.log(`Processing file: ${file.originalname} (${file.mimetype})`);
      const filePath = file.path;
      const ext = path.extname(file.originalname).toLowerCase();
      
      if (ext === '.xlsx' || ext === '.xls') {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        // Extract emails from all cells
        const stringifiedData = JSON.stringify(data);
        allEmails.push(...extractEmailsFromText(stringifiedData));
      } 
      else if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        allEmails.push(...extractEmailsFromText(data.text));
      } 
      else if (ext === '.txt') {
        const data = fs.readFileSync(filePath, 'utf-8');
        allEmails.push(...extractEmailsFromText(data));
      }
      
      // Clean up file
      fs.unlinkSync(filePath);
    }
    
    // De-duplicate
    const uniqueEmails = [...new Set(allEmails)];
    console.log(`Successfully extracted ${uniqueEmails.length} unique emails`);
    res.json({ emails: uniqueEmails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to extract data' });
  }
});

// 2. AI Content Generation
app.post('/api/generate-content', async (req, res) => {
  const { prompt } = req.body;
  console.log("AI Generation requested for prompt:", prompt);
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("AI Error: No API Key found in process.env");
    return res.status(500).json({ error: 'AI not configured' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    console.log("Fetching from Gemini URL...");
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    console.log("Gemini Response Status:", response.status);
    
    if (!response.ok) {
      console.error("Gemini API error details:", JSON.stringify(data));
      throw new Error(data.error?.message || `AI error: ${response.status}`);
    }
    
    const text = data.candidates[0].content.parts[0].text;
    res.json({ content: text });
  } catch (error) {
    console.error("Gemini Fetch Error:", error.message);
    res.status(500).json({ error: `AI generation failed: ${error.message}` });
  }
});

// 3. Send OTP
let otpStore = {}; // In-memory for demo, use DB or Redis for prod
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 600000 }; // 10 min

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Your Verification OTP',
      text: `Your OTP for mass email verification is: ${otp}`,
    });
    res.json({ message: 'OTP sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// 4. Verify OTP & Send Bulk Mail with Attachments
app.post('/api/send-bulk', upload.array('attachments'), async (req, res) => {
  const { senderEmail, otp, subject, content } = req.body;
  const recipients = JSON.parse(req.body.recipients || '[]');
  
  if (!otpStore[senderEmail] || otpStore[senderEmail].otp !== otp || otpStore[senderEmail].expires < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  // Clear OTP
  delete otpStore[senderEmail];

  // Prepare attachments for Nodemailer
  const mailAttachments = req.files.map(file => ({
    filename: file.originalname,
    path: file.path
  }));

  try {
    // Send in bulk (single message with BCC for privacy)
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      bcc: recipients.join(','),
      subject: subject,
      text: content,
      attachments: mailAttachments
    });
    
    // Clean up uploaded attachments
    req.files.forEach(file => fs.unlinkSync(file.path));
    
    res.json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send emails' });
  }
});

app.get('/api/list-models', async (req, res) => {
  if (!genAI) return res.status(500).json({ error: 'AI not configured' });
  try {
    // Correct way to list models in legacy SDK is usually through the client
    // But since we are struggling, I'll try gemini-1.0-pro as a last resort
    res.json({ message: "Try gemini-1.0-pro" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

process.on('uncaughtException', (err) => {
  console.error('CRITICAL ERROR:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
module.exports = app;
