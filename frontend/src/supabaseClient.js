import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://<SUA-URL>.supabase.co';
const supabaseKey = '<SUA-CHAVE-ANON>';

export const supabase = createClient(supabaseUrl, supabaseKey);
