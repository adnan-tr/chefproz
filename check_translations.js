import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTranslations() {
  try {
    console.log('Checking translations table...');
    
    // Get all translations
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .order('key');
    
    if (error) {
      console.error('Error fetching translations:', error);
      return;
    }
    
    console.log(`Total translations found: ${data.length}`);
    
    // Check for specific keys mentioned by user
    const keysToCheck = [
      'header.company_name',
      'header.company_tagline', 
      'products.inoksan_title',
      'products.inoksan_description',
      'language.select',
      'products.featured'
    ];
    
    console.log('\nChecking specific keys:');
    keysToCheck.forEach(key => {
      const translation = data.find(t => t.key === key);
      if (translation) {
        console.log(`✓ ${key}: EN="${translation.en}" AR="${translation.ar}"`);
      } else {
        console.log(`✗ ${key}: NOT FOUND`);
      }
    });
    
    // Show first 20 keys for reference
    console.log('\nFirst 20 translation keys:');
    data.slice(0, 20).forEach(t => {
      console.log(`- ${t.key}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTranslations();