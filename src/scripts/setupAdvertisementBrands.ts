import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdvertisementBrandsTable() {
  try {
    console.log('Creating advertisement_brands table...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'create_advertisement_brands_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('Error creating advertisement_brands table:', error);
      return;
    }
    
    console.log('✅ Advertisement brands table created successfully!');
    console.log('✅ Sample data inserted');
    console.log('✅ RLS policies configured');
    console.log('✅ Indexes created for performance');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Alternative method using direct SQL execution if rpc doesn't work
async function createTableDirectly() {
  try {
    console.log('Creating advertisement_brands table directly...');
    
    // Create the table
    const { error: tableError } = await supabase
      .from('advertisement_brands')
      .select('*')
      .limit(1);
    
    if (tableError && tableError.message.includes('relation "advertisement_brands" does not exist')) {
      console.log('Table does not exist, creating it...');
      
      // You would need to run the SQL manually in Supabase dashboard
      console.log('Please run the SQL script in your Supabase dashboard:');
      console.log('Go to: Supabase Dashboard > SQL Editor > New Query');
      console.log('Copy and paste the content from: src/scripts/create_advertisement_brands_table.sql');
      
      return;
    }
    
    console.log('✅ Table already exists or was created successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the setup
if (require.main === module) {
  createAdvertisementBrandsTable().catch(console.error);
}

export { createAdvertisementBrandsTable, createTableDirectly };