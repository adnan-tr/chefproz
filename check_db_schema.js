// Script to check database schema using Supabase client with service role key
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkDatabaseSchema() {
  try {
    console.log('Checking database schema with service role key...');

    // First, let's try to get the clients table schema
    console.log('\nChecking clients table schema:');
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);

    if (clientsError) {
      console.error('Error accessing clients table:', clientsError);
    } else {
      console.log('Successfully accessed clients table');
      if (clientsData && clientsData.length > 0) {
        console.log('Sample client data:', clientsData[0]);
        console.log('Client table columns:', Object.keys(clientsData[0]).join(', '));
      } else {
        console.log('Clients table is empty');
      }
    }

    // Check if the priority column exists in the clients table
    if (clientsData && clientsData.length > 0) {
      const hasPriorityColumn = 'priority' in clientsData[0];
      console.log('Priority column exists in clients table:', hasPriorityColumn);
      if (hasPriorityColumn) {
        console.log('Priority value:', clientsData[0].priority);
      }
    }

    // Check quotations table
    console.log('\nChecking quotations table:');
    const { data: quotationsData, error: quotationsError } = await supabase
      .from('quotations')
      .select('*')
      .limit(5);

    if (quotationsError) {
      console.error('Error accessing quotations table:', quotationsError);
    } else {
      console.log('Successfully accessed quotations table');
      console.log('Number of quotations:', quotationsData.length);
      if (quotationsData && quotationsData.length > 0) {
        console.log('Quotation table columns:', Object.keys(quotationsData[0]).join(', '));
        console.log('Sample quotation data:', quotationsData[0]);
      } else {
        console.log('Quotations table is empty');
      }
    }

    // Try to execute a SQL query to get table information
    console.log('\nAttempting to get table information using SQL:');
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('execute_sql', {
        query: `
          SELECT 
            table_name, 
            column_name, 
            data_type 
          FROM 
            information_schema.columns 
          WHERE 
            table_schema = 'public' 
          ORDER BY 
            table_name, 
            ordinal_position;
        `
      });

    if (tablesError) {
      console.error('Error executing SQL query:', tablesError);
      console.log('Note: The execute_sql RPC function might not exist in your Supabase instance.');
    } else {
      console.log('Table information:', tablesData);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkDatabaseSchema();