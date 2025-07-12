// Script to check quotation table constraints
import fetch from 'node-fetch';

const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8';

async function checkQuotationConstraints() {
  try {
    // Check table constraints using PostgreSQL system tables
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/exec_sql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          sql: `
            SELECT 
              conname as constraint_name,
              pg_get_constraintdef(oid) as constraint_definition
            FROM pg_constraint 
            WHERE conrelid = 'quotations'::regclass
              AND contype = 'c';
          `
        })
      }
    );

    const result = await response.json();
    console.log('Quotation table constraints:', result);

    // Also check the table structure
    const structureResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/exec_sql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          sql: `
            SELECT 
              column_name,
              data_type,
              is_nullable,
              column_default
            FROM information_schema.columns 
            WHERE table_name = 'quotations' 
              AND table_schema = 'public'
            ORDER BY ordinal_position;
          `
        })
      }
    );

    const structureResult = await structureResponse.json();
    console.log('\nQuotation table structure:', structureResult);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkQuotationConstraints();