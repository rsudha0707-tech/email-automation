-- Supabase Database Setup Script for Email Automation Portal

-- 1. Table for extracted recipients
CREATE TABLE IF NOT EXISTS recipients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    company_name TEXT,
    source_file TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table for tracking email campaigns
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    recipient_count INTEGER,
    status TEXT DEFAULT 'sent', -- 'draft', 'sent', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table for OTP verification (optional, can be in-memory as implemented)
-- But good for audit logs
CREATE TABLE IF NOT EXISTS otp_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'expired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes')
);

-- Enable Row Level Security (RLS) if needed, 
-- or disable it for simple demo purposes (not recommended for production)
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_logs ENABLE ROW LEVEL SECURITY;

-- Simple policy: Allow authenticated users to perform all actions
CREATE POLICY "Allow all for authenticated users" ON recipients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON campaigns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON otp_logs FOR ALL USING (auth.role() = 'authenticated');
