import { supabase } from '../lib/supabase';

async function createServicesTable() {
  console.log('Creating services table...');
  
  // Create the services table
  const { error: createTableError } = await supabase.rpc('create_services_table');
  
  if (createTableError) {
    console.error('Error creating services table:', createTableError);
    return;
  }
  
  console.log('Services table created successfully!');
  
  // Services table is ready - no sample data inserted
  // Services should be added through the admin panel
  console.log('Services table created successfully! Add services through the admin panel.');
}

// Execute the function
createServicesTable()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err));