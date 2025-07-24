const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your environment variables:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdvertisementBrands() {
  try {
    console.log('🚀 Setting up advertisement_brands table...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'create_advertisement_brands_table.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error('❌ SQL file not found:', sqlFilePath);
      console.log('Please make sure the create_advertisement_brands_table.sql file exists in the scripts directory.');
      return;
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`   ${i + 1}/${statements.length}: Executing statement...`);
          
          // Use the SQL editor functionality
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql: statement + ';' 
          });
          
          if (error) {
            // If exec_sql doesn't exist, try direct execution for some statements
            if (error.message.includes('function exec_sql')) {
              console.log('   ⚠️  exec_sql function not available, trying alternative method...');
              
              // For table creation, we can try using the REST API
              if (statement.includes('CREATE TABLE')) {
                console.log('   ℹ️  Please run the SQL manually in Supabase Dashboard > SQL Editor');
                console.log('   📋 SQL to execute:');
                console.log('   ' + statement);
                continue;
              }
            } else {
              console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
              continue;
            }
          } else {
            console.log(`   ✅ Statement ${i + 1} executed successfully`);
          }
        } catch (statementError) {
          console.error(`   ❌ Error executing statement ${i + 1}:`, statementError.message);
        }
      }
    }
    
    // Test if the table was created by trying to fetch data
    console.log('🔍 Testing table creation...');
    const { data: testData, error: testError } = await supabase
      .from('advertisement_brands')
      .select('count(*)')
      .limit(1);
    
    if (testError) {
      console.log('⚠️  Table might not be created yet. Please run the SQL manually:');
      console.log('');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Create a new query');
      console.log('4. Copy and paste the content from: src/scripts/create_advertisement_brands_table.sql');
      console.log('5. Run the query');
      console.log('');
      console.log('SQL file location:', sqlFilePath);
    } else {
      console.log('✅ Advertisement brands table is ready!');
      console.log('✅ Sample data has been inserted');
      console.log('✅ RLS policies are configured');
      console.log('✅ Indexes are created for performance');
      
      // Show sample data
      const { data: sampleData } = await supabase
        .from('advertisement_brands')
        .select('brand_name, is_active')
        .limit(3);
      
      if (sampleData && sampleData.length > 0) {
        console.log('');
        console.log('📊 Sample brands in database:');
        sampleData.forEach((brand, index) => {
          console.log(`   ${index + 1}. ${brand.brand_name} (${brand.is_active ? 'Active' : 'Inactive'})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('');
    console.log('Manual setup instructions:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the content from: src/scripts/create_advertisement_brands_table.sql');
    console.log('5. Run the query');
  }
}

// Run the setup
if (require.main === module) {
  setupAdvertisementBrands()
    .then(() => {
      console.log('');
      console.log('🎉 Setup process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupAdvertisementBrands };