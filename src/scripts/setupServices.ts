import { supabase } from '../lib/supabase';
import fs from 'fs';
import path from 'path';

async function setupServices() {
  try {
    console.log('Setting up services table...');
    
    // Read the SQL file
    const sqlFilePath = path.resolve(__dirname, 'create_services_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL to create the function
    const { error: functionError } = await supabase.rpc('exec_sql', { sql: sqlContent });
    if (functionError) {
      console.error('Error creating function:', functionError);
      return;
    }
    
    // Call the function to create the table
    const { error: tableError } = await supabase.rpc('create_services_table');
    if (tableError) {
      console.error('Error creating services table:', tableError);
      return;
    }
    
    console.log('Services table created successfully!');
    
    // Services table is ready - no sample data inserted
    // Services should be added through the admin panel
    console.log('Services table created successfully! Add services through the admin panel.');
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

// Execute the function
setupServices()
  .then(() => console.log('Setup completed'))
  .catch(err => console.error('Setup failed:', err));