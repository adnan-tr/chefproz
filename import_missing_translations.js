import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream } from 'fs';
import csv from 'csv-parser';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwODc0MTMsImV4cCI6MjA2NjY2MzQxM30.adJwb6qCv6rSRDRnUXbh0tJZiEYuzbWfT4tuMtbkrSs';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Path to the CSV file
const csvFilePath = path.resolve(__dirname, 'missing_translations_to_add.csv');

async function importTranslations() {
  try {
    console.log(`Importing translations from ${csvFilePath}...`);
    
    // Check if the file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`File not found: ${csvFilePath}`);
      return;
    }
    
    const translations = [];
    
    // Parse the CSV file
    await new Promise((resolve, reject) => {
      createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          // Ensure the key exists
          if (row.key) {
            translations.push({
              key: row.key,
              en: row.en || '',
              ru: row.ru || '',
              es: row.es || '',
              tr: row.tr || '',
              ar: row.ar || ''
            });
          }
        })
        .on('end', () => {
          console.log(`Parsed ${translations.length} translations from CSV`);
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    
    if (translations.length === 0) {
      console.log('No translations found in the CSV file.');
      return;
    }
    
    // Import translations to Supabase
    console.log('Importing translations to Supabase...');
    
    // Process translations in batches to avoid timeouts
    const batchSize = 50;
    for (let i = 0; i < translations.length; i += batchSize) {
      const batch = translations.slice(i, i + batchSize);
      
      // For each translation in the batch, check if it exists and update or insert accordingly
      for (const translation of batch) {
        // Check if the key already exists
        const { data: existingTranslation, error: checkError } = await supabase
          .from('translations')
          .select('*')
          .eq('key', translation.key)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is the error code for 'no rows returned'
          console.error(`Error checking translation ${translation.key}:`, checkError);
          continue;
        }
        
        if (existingTranslation) {
          // Update existing translation
          const { error: updateError } = await supabase
            .from('translations')
            .update(translation)
            .eq('key', translation.key);
          
          if (updateError) {
            console.error(`Error updating translation ${translation.key}:`, updateError);
          } else {
            console.log(`Updated translation: ${translation.key}`);
          }
        } else {
          // Insert new translation
          const { error: insertError } = await supabase
            .from('translations')
            .insert([translation]);
          
          if (insertError) {
            console.error(`Error inserting translation ${translation.key}:`, insertError);
          } else {
            console.log(`Inserted new translation: ${translation.key}`);
          }
        }
      }
      
      console.log(`Processed batch ${i/batchSize + 1} of ${Math.ceil(translations.length/batchSize)}`);
    }
    
    console.log('Translation import completed successfully!');
    
    // Count total translations in the database
    const { count, error: countError } = await supabase
      .from('translations')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting translations:', countError);
    } else {
      console.log(`Total translations in database: ${count}`);
    }
    
  } catch (error) {
    console.error('Error importing translations:', error);
  }
}

// Run the import function
importTranslations();