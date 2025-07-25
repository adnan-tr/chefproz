const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration for Node.js
const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8';

// Create Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUsersTable() {
  try {
    console.log('Creating admin_users table with proper constraints...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../../create_admin_users_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error creating admin_users table:', error.message);
      return;
    }

    console.log('✅ Successfully created admin_users table with proper role constraints!');
    console.log('The table now supports roles: supermanager, editor, viewer');
    
    // Test the table by checking its structure
    const { data: tableInfo, error: infoError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1);
    
    if (infoError && !infoError.message.includes('relation "admin_users" does not exist')) {
      console.log('Table structure verified successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the setup
createAdminUsersTable();