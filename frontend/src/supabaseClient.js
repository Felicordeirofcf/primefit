import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmvqdzxvbmhugolcyojw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtdnFkenh2Ym1odWdvbGN5b2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MDkxMzMsImV4cCI6MjA2NDQ4NTEzM30.CdMzMmHSGmshPAse2NzK7mvqHcegpe3-HfTc6wdNWq8';

export const supabase = createClient(supabaseUrl, supabaseKey);
