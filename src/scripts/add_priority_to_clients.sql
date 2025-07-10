-- Add priority column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- Update the RLS policy to include the new column
ALTER POLICY "Enable read access for authenticated users" ON clients
  USING (auth.role() = 'authenticated');

ALTER POLICY "Enable insert for authenticated users" ON clients
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

ALTER POLICY "Enable update for authenticated users" ON clients
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');