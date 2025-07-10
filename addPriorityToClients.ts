import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
// Note: You'll need to provide your service key when running this script
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addPriorityToClients() {
  try {
    console.log('Adding priority column to clients table...');
    
    // SQL to add priority column if it doesn't exist
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add priority column to clients table if it doesn't exist
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'clients' AND column_name = 'priority') THEN
                ALTER TABLE clients ADD COLUMN priority TEXT DEFAULT 'medium';
            END IF;

            -- Update RLS policies to include the new column
            -- Drop existing policies if they exist
            DROP POLICY IF EXISTS "Clients are viewable by authenticated users" ON clients;
            DROP POLICY IF EXISTS "Clients are insertable by authenticated users" ON clients;
            DROP POLICY IF EXISTS "Clients are updatable by authenticated users" ON clients;

            -- Recreate policies with the new column
            CREATE POLICY "Clients are viewable by authenticated users"
            ON clients FOR SELECT
            USING (auth.role() = 'authenticated');

            CREATE POLICY "Clients are insertable by authenticated users"
            ON clients FOR INSERT
            WITH CHECK (auth.role() = 'authenticated');

            CREATE POLICY "Clients are updatable by authenticated users"
            ON clients FOR UPDATE
            USING (auth.role() = 'authenticated');
        END $$;
      `
    });
    
    if (error) {
      console.error('Error adding priority column:', error);
      return;
    }
    
    console.log('Priority column added successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

addPriorityToClients();