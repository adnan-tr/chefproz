const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const adminUsers = [
  {
    email: 'adnan@hublinq.com',
    name: 'Adnan',
    role: 'supermanager',
    password: 'Adnan2025?'
  },
  {
    email: 'dani@hublinq.com',
    name: 'Dani',
    role: 'editor',
    password: 'Dani2025!'
  },
  {
    email: 'israfil@hublinq.com',
    name: 'Israfil',
    role: 'viewer',
    password: 'Israfil2025&'
  }
];

async function createAdminUsers() {
  console.log('🚀 Creating admin users with passwords...\n');

  for (const user of adminUsers) {
    try {
      console.log(`Creating user: ${user.email} (${user.role})`);
      
      const { data, error } = await supabase.rpc('create_admin_user_with_password', {
        p_email: user.email,
        p_name: user.name,
        p_role: user.role,
        p_password: user.password,
        p_status: 'active'
      });

      if (error) {
        console.error(`❌ Error creating ${user.email}:`, error.message);
        continue;
      }

      if (data && data.success) {
        console.log(`✅ Successfully created ${user.email}`);
        console.log(`   User ID: ${data.user_id}`);
      } else {
        console.error(`❌ Failed to create ${user.email}:`, data?.message || 'Unknown error');
      }
    } catch (err) {
      console.error(`❌ Exception creating ${user.email}:`, err.message);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('✨ Admin user creation process completed!');
  console.log('\n📋 Login Credentials:');
  console.log('='.repeat(50));
  adminUsers.forEach(user => {
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${user.password}`);
    console.log(`Role: ${user.role}`);
    console.log('-'.repeat(30));
  });
}

async function checkConstraints() {
  console.log('🔍 Checking admin_users table constraints...\n');
  
  try {
    // Check if the role constraint allows 'supermanager'
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1);

    if (error && error.message.includes('violates check constraint')) {
      console.log('⚠️  Role constraint needs to be updated!');
      console.log('Please run this SQL in your Supabase SQL editor:');
      console.log('');
      console.log('ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;');
      console.log('ALTER TABLE admin_users ADD CONSTRAINT admin_users_role_check CHECK (role IN (\'supermanager\', \'editor\', \'viewer\'));');
      console.log('');
      return false;
    }
    
    console.log('✅ Table constraints look good!');
    return true;
  } catch (err) {
    console.error('❌ Error checking constraints:', err.message);
    return false;
  }
}

async function main() {
  console.log('🔐 Admin Users Setup Script');
  console.log('='.repeat(50));
  
  const constraintsOk = await checkConstraints();
  if (!constraintsOk) {
    console.log('\n❌ Please fix the constraints first, then run this script again.');
    process.exit(1);
  }
  
  await createAdminUsers();
  
  console.log('\n🌐 You can now login at:');
  console.log('http://localhost:3001/secure-mgmt-portal-x7f9q2/login');
}

main().catch(console.error);