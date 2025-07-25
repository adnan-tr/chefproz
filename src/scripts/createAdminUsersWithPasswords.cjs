const { createClient } = require('@supabase/supabase-js');

// Supabase configuration for Node.js
const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8';

// Create Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSuperManagerWithPassword() {
  try {
    console.log('=== Creating Super Manager User with Password ===');
    console.log('');
    
    // First, fix the role constraint if needed
    console.log('1. Fixing role constraint...');
    const constraintSQL = `
      ALTER TABLE admin_users 
      DROP CONSTRAINT IF EXISTS admin_users_role_check;
      
      ALTER TABLE admin_users 
      ADD CONSTRAINT admin_users_role_check 
      CHECK (role IN ('supermanager', 'editor', 'viewer'));
    `;
    
    // Note: This would need to be run manually in Supabase SQL editor
    console.log('Please run this SQL in your Supabase SQL editor first:');
    console.log(constraintSQL);
    console.log('');
    
    // Create the user with password using the function
    console.log('2. Creating Super Manager user...');
    
    const { data, error } = await supabase
      .rpc('create_admin_user_with_password', {
        p_email: 'adnan@hublinq.com',
        p_name: 'Adnan',
        p_role: 'supermanager',
        p_password: 'ChefGear2024!', // Strong default password
        p_status: 'active'
      });

    if (error) {
      console.error('❌ Error creating user:', error);
      
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('');
        console.log('The admin credentials table and functions need to be created first.');
        console.log('Please run the SQL from create_admin_credentials_table.sql in your Supabase SQL editor.');
        console.log('');
        console.log('Then run this script again.');
      }
      return;
    }

    console.log('✅ Result:', data);
    
    if (data.success) {
      console.log('');
      console.log('🎉 Super Manager user created successfully!');
      console.log('');
      console.log('📧 Email: adnan@hublinq.com');
      console.log('🔑 Password: ChefGear2024!');
      console.log('👤 Role: supermanager');
      console.log('');
      console.log('🔐 Login URL: http://localhost:3001/secure-mgmt-portal-x7f9q2/login');
      console.log('');
      console.log('⚠️  IMPORTANT: Please change the password after first login!');
    } else {
      console.log('❌ Failed to create user:', data.message);
      if (data.error) {
        console.log('Error details:', data.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

async function createAdditionalUsers() {
  console.log('');
  console.log('=== Creating Additional Admin Users ===');
  console.log('');
  
  const users = [
    {
      email: 'editor@chefgear.com',
      name: 'Editor User',
      role: 'editor',
      password: 'Editor2024!'
    },
    {
      email: 'viewer@chefgear.com',
      name: 'Viewer User',
      role: 'viewer',
      password: 'Viewer2024!'
    }
  ];
  
  for (const user of users) {
    try {
      console.log(`Creating ${user.role}: ${user.email}...`);
      
      const { data, error } = await supabase
        .rpc('create_admin_user_with_password', {
          p_email: user.email,
          p_name: user.name,
          p_role: user.role,
          p_password: user.password,
          p_status: 'active'
        });

      if (error) {
        console.log(`❌ Error creating ${user.role}:`, error.message);
      } else if (data.success) {
        console.log(`✅ ${user.role} created successfully`);
      } else {
        console.log(`❌ Failed to create ${user.role}:`, data.message);
      }
    } catch (error) {
      console.log(`❌ Error creating ${user.role}:`, error.message);
    }
  }
}

async function testLogin() {
  console.log('');
  console.log('=== Testing Login Function ===');
  console.log('');
  
  try {
    const { data, error } = await supabase
      .rpc('verify_admin_login', {
        p_email: 'adnan@hublinq.com',
        p_password: 'ChefGear2024!'
      });

    if (error) {
      console.log('❌ Login test error:', error.message);
    } else {
      console.log('🔐 Login test result:', data);
    }
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
  }
}

// Run the setup
console.log('🚀 ChefGear Admin User Setup with Password Management');
console.log('');

createSuperManagerWithPassword()
  .then(() => createAdditionalUsers())
  .then(() => testLogin())
  .then(() => {
    console.log('');
    console.log('✅ Setup completed!');
    console.log('');
    console.log('📋 Summary of created users:');
    console.log('1. adnan@hublinq.com (supermanager) - Password: ChefGear2024!');
    console.log('2. editor@chefgear.com (editor) - Password: Editor2024!');
    console.log('3. viewer@chefgear.com (viewer) - Password: Viewer2024!');
    console.log('');
    console.log('🔗 Login at: http://localhost:3001/secure-mgmt-portal-x7f9q2/login');
  });