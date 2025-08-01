const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://ztjmxvdlpniaxqpjyebi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0am14dmRscG5pYXhxcGp5ZWJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcxNzI2NCwiZXhwIjoyMDQ4MjkzMjY0fQ.Ej5TFvGOKJnZJhGJKqNJJqNJJqNJJqNJJqNJJqNJJqM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addTechnicalSpecifications() {
  try {
    console.log('Adding technical specification fields to products table...');
    
    // SQL commands to add the new columns
    const sqlCommands = [
      'ALTER TABLE products ADD COLUMN IF NOT EXISTS hz NUMERIC',
      'ALTER TABLE products ADD COLUMN IF NOT EXISTS voltage NUMERIC',
      'ALTER TABLE products ADD COLUMN IF NOT EXISTS power NUMERIC',
      'ALTER TABLE products ADD COLUMN IF NOT EXISTS litre NUMERIC',
      'ALTER TABLE products ADD COLUMN IF NOT EXISTS kg NUMERIC'
    ];
    
    for (const command of sqlCommands) {
      console.log(`Executing: ${command}`);
      
      try {
        // Try using the SQL editor approach
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.log('RPC method not available, trying alternative approach...');
          // Alternative: Use a simple query to test connection
          const { data, error: testError } = await supabase
            .from('products')
            .select('id')
            .limit(1);
          
          if (testError) {
            console.error('Connection test failed:', testError);
          } else {
            console.log('✓ Connection successful, but cannot execute DDL commands via client');
          }
        } else {
          console.log('✓ Command executed successfully');
        }
      } catch (err) {
        console.log('Command execution failed:', err.message);
      }
    }
    
    console.log('\n📋 Manual SQL Commands to Execute in Supabase Dashboard:');
    console.log('Please run these commands in your Supabase SQL Editor:');
    console.log('----------------------------------------');
    sqlCommands.forEach(cmd => console.log(cmd + ';'));
    console.log('----------------------------------------');
    
    // Test current table structure
    console.log('\nTesting current table structure...');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error accessing products table:', error);
    } else {
      console.log('✓ Products table accessible');
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        console.log('Current columns:', columns);
        
        const techFields = ['hz', 'voltage', 'power', 'litre', 'kg'];
        const existingTechFields = techFields.filter(field => columns.includes(field));
        
        if (existingTechFields.length > 0) {
          console.log('✅ Technical fields already present:', existingTechFields);
        } else {
          console.log('⚠️  Technical fields not found. Please run the SQL commands manually.');
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Execute the function
addTechnicalSpecifications();