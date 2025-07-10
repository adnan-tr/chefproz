// Script to check quotation statuses
import fetch from 'node-fetch';

const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8';

async function checkQuotationStatuses() {
  try {
    // Get all quotations
    const response = await fetch(
      `${supabaseUrl}/rest/v1/quotations?select=id,quotation_number,status,order_id&order=created_at.desc`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    const quotations = await response.json();
    console.log('Quotations:', quotations);

    // Count quotations by status
    const statusCounts = {};
    quotations.forEach(q => {
      statusCounts[q.status] = (statusCounts[q.status] || 0) + 1;
    });

    console.log('\nStatus counts:', statusCounts);

    // Check if there are any quotations with 'confirm_order' status
    const confirmOrderQuotations = quotations.filter(q => q.status === 'confirm_order');
    console.log('\nQuotations with confirm_order status:', confirmOrderQuotations);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkQuotationStatuses();