// Script to check database tables
import fetch from 'node-fetch';

const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8';

async function checkDatabaseTables() {
  try {
    // Check clients table
    const clientsResponse = await fetch(
      `${supabaseUrl}/rest/v1/clients?select=count&limit=1`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact'
        }
      }
    );

    const clientsCount = clientsResponse.headers.get('content-range')?.split('/')?.pop() || '0';
    console.log('Clients count:', clientsCount);

    // Check quotations table
    const quotationsResponse = await fetch(
      `${supabaseUrl}/rest/v1/quotations?select=count&limit=1`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact'
        }
      }
    );

    const quotationsCount = quotationsResponse.headers.get('content-range')?.split('/')?.pop() || '0';
    console.log('Quotations count:', quotationsCount);

    // Check orders table
    const ordersResponse = await fetch(
      `${supabaseUrl}/rest/v1/orders?select=count&limit=1`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact'
        }
      }
    );

    const ordersCount = ordersResponse.headers.get('content-range')?.split('/')?.pop() || '0';
    console.log('Orders count:', ordersCount);

    // List all tables in the public schema
    console.log('\nAttempting to list all tables...');
    const tablesResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/exec_sql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          sql: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
        })
      }
    );

    const tablesData = await tablesResponse.text();
    console.log('Tables response:', tablesResponse.status);
    console.log('Tables data:', tablesData);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabaseTables();