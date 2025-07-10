import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('Starting fixes...');

    // 1. Add priority column to clients table
    console.log('Adding priority column to clients table...');
    const sqlScript = fs.readFileSync(path.join(__dirname, 'add_priority_to_clients.sql'), 'utf8');
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql: sqlScript });
    
    if (sqlError) {
      console.error('Error executing SQL script:', sqlError);
    } else {
      console.log('Priority column added successfully!');
    }

    // 2. Fix the QuotationBuilderPage.tsx file
    console.log('\nTo fix the quotation confirmation workflow, please make the following changes to QuotationBuilderPage.tsx:');
    console.log('\n1. Update the handleConvertToOrder function:');
    console.log(`
const handleConvertToOrder = (quotationId: string) => {
  const quotation = quotations.find(q => q.id === quotationId);
  
  if (!quotation) return;
  
  // If the quotation is in 'accepted' status, first change it to 'confirm_order'
  if (quotation.status === 'accepted') {
    updateQuotationStatus(quotationId, 'confirm_order');
  } 
  // If it's already in 'confirm_order' status, proceed with the conversion
  else if (quotation.status === 'confirm_order') {
    setQuotationToConvert(quotation);
    setIsOrderConfirmModalOpen(true);
  }
};
`);

    console.log('\n2. Update the Convert to Order button in the UI:');
    console.log(`
{selectedQuotationObj && canConvertToOrder(selectedQuotationObj) && (
  <Button 
    size="sm" 
    className={selectedQuotationObj.status === 'accepted' 
      ? "bg-orange-500 hover:bg-orange-600 text-white min-w-0" 
      : "bg-green-600 hover:bg-green-700 text-white min-w-0"}
    onClick={() => handleConvertToOrder(selectedQuotationObj.id)}
    disabled={isConvertingToOrder}
  >
    {selectedQuotationObj.status === 'accepted' 
      ? <><CheckSquare className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Confirm Order</span></> 
      : <><ShoppingCart className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Convert to Order</span></>}
  </Button>
)}
`);

    console.log('\nFixes completed successfully!');
  } catch (error) {
    console.error('Error fixing issues:', error);
  }
}

main();