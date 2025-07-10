import { supabase } from '../lib/supabase';

async function addPriorityToClients() {
  console.log('Adding priority column to clients table...');
  
  try {
    // Read the SQL file content
    const fs = require('fs');
    const path = require('path');
    const sqlContent = fs.readFileSync(
      path.join(__dirname, 'add_priority_to_clients.sql'),
      'utf8'
    );

    // Execute the SQL commands
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('Error executing SQL:', error);
      return;
    }
    
    console.log('Priority column added successfully to clients table!');
  } catch (error) {
    console.error('Error adding priority column:', error);
  }
}

// Execute the function
addPriorityToClients();