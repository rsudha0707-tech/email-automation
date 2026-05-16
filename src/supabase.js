import { createClient } from '@supabase/supabase-js';

// --- ACTION REQUIRED: PASTE YOUR KEYS BELOW ---
const supabaseUrl = 'https://aryjmwhfrroqwsoyyhyz.supabase.co';
const supabaseAnonKey = 'saryjmwhfrroqwsoyyhyz';

export const supabase = (supabaseUrl && !supabaseUrl.includes('YOUR_'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
