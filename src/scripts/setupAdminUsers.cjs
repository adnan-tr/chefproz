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
    
    // Sample admin users data using allowed roles: 'editor' and 'viewer'
    const sampleUsers = [
      {
        name: 'Content Editor',
        email: 'editor@chefpro.com',
        role: 'editor',
        status: 'active',
        last_login: new Date().toISOString()
      },
      {
        name: 'Content Viewer',
        email: 'viewer@chefpro.com',
        role: 'viewer',
        status: 'active',
        last_login: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        name: 'Senior Editor',
        email: 'senior.editor@chefpro.com',
        role: 'editor',
        status: 'active',
        last_login: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
      }
    ];

    const { data, error } = await supabase
      .from('admin_users')
      .insert(sampleUsers)
      .select();

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