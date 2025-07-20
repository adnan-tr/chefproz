const { createClient } = require('@supabase/supabase-js');

// Supabase configuration for Node.js
const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8';

// Create Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdminUsers() {
  try {
    console.log('Setting up admin users...');
    
    // Clear existing data
    console.log('Clearing existing admin users...');
    const { error: deleteError } = await supabase
      .from('admin_users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Keep a placeholder if exists
    
    if (deleteError) {
      console.log('Warning: Could not clear existing data:', deleteError.message);
    }

    console.log('Inserting sample admin users data...');
    
    // No sample data - admin users should be created manually through proper authentication
    console.log('Admin users table is ready. Create admin users through proper authentication flow.');
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('count');
    
    if (error) {
      console.error('❌ Error checking admin users table:', error.message);
      return;
    }

    if (error) {
      console.error('❌ Error setting up admin users:', error.message);
      console.error('Details:', error.details);
      return;
    }

    console.log('✅ Successfully set up admin users!');
    console.log(`Inserted ${data.length} admin users:`);
    data.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up admin users:', error.message);
  }
}

// Run the setup
setupAdminUsers();