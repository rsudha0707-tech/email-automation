# Digital Daak Email Portal 🚀

An intelligent email automation system that extracts data from files (Excel, PDF, Text), uses AI to generate content, and ensures security with OTP verification.

## 🛠 Setup Instructions

### 1. Backend Configuration
Navigate to the `backend/` folder and update your `.env` file with:
- **SMTP Details**: Your Gmail/Outlook SMTP settings.
- **Supabase**: URL and Anon Key from your Supabase dashboard.
- **Gemini AI**: API Key from Google AI Studio.

### 2. Database Setup (Supabase)
Run the contents of [supabase_setup.sql](file:///Users/sudha/antigravity-project/email-automation/supabase_setup.sql) in your Supabase SQL Editor to create the necessary tables.

### 3. Running Locally
- **Backend**: `cd backend && npm start`
- **Frontend**: `cd frontend && npm run dev`

### 4. GitHub Deployment
1. Create a new repository on GitHub.
2. Link it: `git remote add origin YOUR_REPO_URL`
3. Push: `git push -u origin main`

## ✨ Features
- **File Parsing**: Automatic email extraction from uploaded documents.
- **AI Agent**: Draft context-aware emails using Gemini.
- **OTP Shield**: Verifies the sender before mass mailing.
- **Supabase Integration**: Stores recipient history and campaign logs.
