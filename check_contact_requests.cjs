const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwODc0MTMsImV4cCI6MjA2NjY2MzQxM30.adJwb6qCv6rSRDRnUXbh0tJZiEYuzbWfT4tuMtbkrSs';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContactRequests() {
  try {
    console.log('Checking contact_requests table...');
    const { data, error } = await supabase
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching contact requests:', error);
      return;
    }
    
    console.log(`Found ${data?.length || 0} contact requests:`);
    if (data && data.length > 0) {
      data.forEach((request, index) => {
        console.log(`\n--- Contact Request ${index + 1} ---`);
        console.log('ID:', request.id);
        console.log('Name:', request.name);
        console.log('Email:', request.email);
        console.log('Company:', request.company);
        console.log('Message:', request.message);
        console.log('Created:', request.created_at);
      });
    } else {
      console.log('No contact requests found in the database.');
    }
    
    // Also check clients table
    console.log('\n\nChecking clients table...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      return;
    }
    
    console.log(`Found ${clients?.length || 0} clients:`);
    if (clients && clients.length > 0) {
      clients.forEach((client, index) => {
        console.log(`\n--- Client ${index + 1} ---`);
        console.log('ID:', client.id);
        console.log('Company:', client.company_name);
        console.log('Contact Person:', client.contact_person);
        console.log('Email:', client.email);
        console.log('Created:', client.created_at);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkContactRequests();