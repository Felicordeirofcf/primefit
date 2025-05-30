import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hfislrtjoyfywiyyoccg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmaXNscnRqb3lmeXdpeXlvY2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODIwMTQsImV4cCI6MjA2MTg1ODAxNH0.3trjCNxRxBx_7swwC_wsZ4Xonn06o7NiQbf6BgFbung';

export const supabase = createClient(supabaseUrl, supabaseKey);
