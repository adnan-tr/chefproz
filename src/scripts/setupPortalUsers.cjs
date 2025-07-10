const { createClient } = require('@supabase/supabase-js');

// Supabase configuration for Node.js
const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8';

// Create Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Portal users sample data
const portalUsersData = [
  {
    email: 'admin@chefpro.com',
    full_name: 'Admin User',
    role: 'admin',
    is_active: true,
    last_login: new Date().toISOString(),
    permissions: ['read', 'write', 'delete', 'admin']
  },
  {
    email: 'manager@chefpro.com',
    full_name: 'Manager User',
    role: 'manager',
    is_active: true,
    last_login: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    permissions: ['read', 'write']
  },
  {
    email: 'user@chefpro.com',
    full_name: 'Regular User',
    role: 'user',
    is_active: true,
    last_login: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    permissions: ['read']
  }
];

async function setupPortalUsers() {
  try {
    console.log('Setting up portal_users table...');
    
    // First, create the table using SQL
    console.log('Creating portal_users table...');
    const fs = require('fs');
    const path = require('path');
    const sqlContent = fs.readFileSync(path.join(__dirname, '../../create_portal_users_table.sql'), 'utf8');
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: sqlContent });
    if (createError && !createError.message.includes('already exists')) {
      console.log('Note: Could not execute SQL directly:', createError.message);
      console.log('Proceeding with data insertion...');
    }
    
    // Clear existing data
    const { error: deleteError } = await supabase
      .from('portal_users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (deleteError) {
      console.log('Note: Could not clear existing data (table might not exist yet):', deleteError.message);
    }
    
    // Insert portal users data
    console.log('Inserting portal users data...');
    const { data, error } = await supabase
      .from('portal_users')
      .insert(portalUsersData)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Portal users setup completed successfully!');
    console.log(`Inserted ${data.length} portal users:`);
    data.forEach(user => {
      console.log(`- ${user.full_name} (${user.email}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up portal users:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupPortalUsers();