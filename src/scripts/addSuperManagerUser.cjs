const { createClient } = require('@supabase/supabase-js');

// Supabase configuration for Node.js
const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8';

// Create Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addSuperManagerUser() {
  try {
    console.log('Adding Super Manager user...');
    
    // First, let's check if the admin_users table exists and what its structure is
    console.log('Checking admin_users table structure...');
    
    // Try to insert the super manager user directly
    const userData = {
      email: 'adnan@hublinq.com',
      name: 'Adnan',
      role: 'supermanager',
      status: 'active'
    };

    console.log('Attempting to insert user:', userData);

    const { data, error } = await supabase
      .from('admin_users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding user:', error);
      
      // If there's a constraint error, let's try to understand the table structure
      if (error.code === '23514') {
        console.log('Check constraint violation detected. Let me check what roles are allowed...');
        
        // Try to get the table schema information
        const { data: schemaData, error: schemaError } = await supabase
          .rpc('get_table_constraints', { table_name: 'admin_users' })
          .single();
          
        if (schemaError) {
          console.log('Could not get schema info. The role constraint might need to be updated.');
          console.log('Please run this SQL in your Supabase SQL editor:');
          console.log(`
ALTER TABLE admin_users 
DROP CONSTRAINT IF EXISTS admin_users_role_check;

ALTER TABLE admin_users 
ADD CONSTRAINT admin_users_role_check 
CHECK (role IN ('supermanager', 'editor', 'viewer'));
          `);
        }
      }
      return;
    }

    console.log('✅ Successfully added Super Manager user!');
    console.log('User details:', data);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Alternative function to manually fix the constraint
async function fixRoleConstraint() {
  try {
    console.log('Attempting to fix role constraint...');
    
    // This would require a custom function in Supabase to execute DDL
    const sql = `
      ALTER TABLE admin_users 
      DROP CONSTRAINT IF EXISTS admin_users_role_check;
      
      ALTER TABLE admin_users 
      ADD CONSTRAINT admin_users_role_check 
      CHECK (role IN ('supermanager', 'editor', 'viewer'));
    `;
    
    console.log('Please execute this SQL in your Supabase SQL editor:');
    console.log(sql);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run both functions
console.log('=== ChefGear Admin User Setup ===');
console.log('');

addSuperManagerUser().then(() => {
  console.log('');
  console.log('=== Role Constraint Fix (if needed) ===');
  fixRoleConstraint();
});