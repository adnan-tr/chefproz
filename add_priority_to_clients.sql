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