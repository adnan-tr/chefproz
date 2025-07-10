// Script to check Supabase tables using the Supabase client library
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseTables() {
  try {
    console.log('Checking Supabase database...');

    // Check clients table
    const { data: clients, error: clientsError, count: clientsCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .limit(1);

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
    } else {
      console.log('Clients table exists with count:', clientsCount);
      if (clients && clients.length > 0) {
        console.log('Sample client:', clients[0]);
      }
    }

    // Check quotations table
    const { data: quotations, error: quotationsError, count: quotationsCount } = await supabase
      .from('quotations')
      .select('*', { count: 'exact' })
      .limit(1);

    if (quotationsError) {
      console.error('Error fetching quotations:', quotationsError);
    } else {
      console.log('Quotations table exists with count:', quotationsCount);
      if (quotations && quotations.length > 0) {
        console.log('Sample quotation:', quotations[0]);
      }
    }

    // Check orders table
    const { data: orders, error: ordersError, count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .limit(1);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    } else {
      console.log('Orders table exists with count:', ordersCount);
      if (orders && orders.length > 0) {
        console.log('Sample order:', orders[0]);
      }
    }

    // Try to get a list of all tables
    console.log('\nAttempting to list all tables...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables')
      .select();

    if (tablesError) {
      console.error('Error listing tables:', tablesError);
      console.log('Note: The get_tables RPC function might not exist in your Supabase instance.');
      
      // Alternative approach: check for specific tables we expect to exist
      console.log('\nChecking for specific tables existence:');
      const expectedTables = [
        'clients', 'quotations', 'orders', 'quotation_items', 'order_items', 
        'services', 'products', 'users', 'profiles'
      ];
      
      for (const tableName of expectedTables) {
        const { data, error } = await supabase
          .from(tableName)
          .select('count(*)', { count: 'exact', head: true })
          .limit(0);
          
        console.log(`Table '${tableName}': ${error ? 'Does not exist or no access' : 'Exists'}`);
      }
    } else {
      console.log('Tables in database:', tables);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkSupabaseTables();