import { supabase } from '../lib/supabase';
import fs from 'fs';
import path from 'path';

async function importServices() {
  try {
    console.log('Importing services from JSON file...');
    
    // Read the JSON file
    const jsonFilePath = path.resolve(process.cwd(), 'services_data.json');
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
    const services = JSON.parse(jsonContent);
    
    console.log(`Found ${services.length} services to import`);
    
    // Use upsert to handle both insert and update
    const { error: insertError } = await supabase
      .from('services')
      .upsert(services, { onConflict: 'service_id' });

    if (insertError) {
      console.error('Error importing services:', insertError);
      return;
    }

    console.log('Services imported successfully!');
  } catch (error) {
    console.error('Import failed:', error);
  }
}

// Execute the function
importServices()
  .then(() => console.log('Import completed'))
  .catch(err => console.error('Import failed:', err));