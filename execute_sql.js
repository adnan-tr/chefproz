// Script to execute SQL using Supabase REST API
import fetch from 'node-fetch';

const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8';

async function executeSql() {
  try {
    // First, check if the priority column already exists
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/clients?select=priority&limit=1`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    const checkData = await checkResponse.json();
    console.log('Check response:', checkResponse.status);
    console.log('Check data:', checkData);

    if (checkResponse.status === 200) {
      console.log('Priority column already exists!');
    } else {
      console.log('Priority column does not exist. Adding it...');
      
      // Execute SQL to add the priority column
      // Note: This requires the rpc function to be set up in Supabase
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
              -- Add priority column to clients table if it doesn't exist
              ALTER TABLE clients ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
            `
          })
        }
      );

      const data = await response.text();
      console.log('Response status:', response.status);
      console.log('Response data:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

executeSql();