const { createClient } = require('@supabase/supabase-js');

// Supabase configuration for Node.js
const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8';

// Create Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPortalUsers() {
  try {
    console.log('Setting up portal users...');
    
    // First, let's check if the table exists by trying to select from it
    console.log('Checking if portal_users table exists...');
    const { data: existingData, error: selectError } = await supabase
      .from('portal_users')
      .select('id')
      .limit(1);
    
    if (selectError) {
      console.log('Table does not exist or has issues:', selectError.message);
      console.log('The portal_users table needs to be created manually in Supabase dashboard.');
      console.log('Please create the table with the following structure:');
      console.log(`
CREATE TABLE public.portal_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  permissions TEXT[] DEFAULT ARRAY['read'],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);`);
      console.log('\nAfter creating the table, run this script again.');
      return;
    }
    
    console.log('✅ Table exists, proceeding with data insertion...');
    
    // Clear existing data
    console.log('Clearing existing portal users...');
    const { error: deleteError } = await supabase
      .from('portal_users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (deleteError) {
      console.log('Warning: Could not clear existing data:', deleteError.message);
    }
    
    // No sample data - portal users should be created through proper registration flow
    console.log('Portal users table is ready. Users should register through the application.');
    
    const { data, error } = await supabase
      .from('portal_users')
      .select('count');
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Portal users table setup completed successfully!');
    console.log('Table is ready for user registration through the application.');
    
  } catch (error) {
    console.error('❌ Error setting up portal users:', error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
    if (error.hint) {
      console.error('Hint:', error.hint);
    }
    process.exit(1);
  }
}

// Run the setup
setupPortalUsers();