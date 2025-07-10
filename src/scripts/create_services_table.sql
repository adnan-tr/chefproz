-- Create a function to create the services table
CREATE OR REPLACE FUNCTION create_services_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'services') THEN
    -- Create the services table
    CREATE TABLE public.services (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      service_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      timeline TEXT NOT NULL,
      starting_price INTEGER NOT NULL,
      icon TEXT NOT NULL,
      image TEXT,
      included_services TEXT[] NOT NULL DEFAULT '{}',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );

    -- Create updated_at trigger
    CREATE TRIGGER set_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

    -- Set up RLS (Row Level Security)
    ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

    -- Create policies
    -- Allow authenticated users to select, insert, update, delete
    CREATE POLICY "Authenticated users can select services"
      ON public.services
      FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Authenticated users can insert services"
      ON public.services
      FOR INSERT
      TO authenticated
      WITH CHECK (true);

    CREATE POLICY "Authenticated users can update services"
      ON public.services
      FOR UPDATE
      TO authenticated
      USING (true);

    CREATE POLICY "Authenticated users can delete services"
      ON public.services
      FOR DELETE
      TO authenticated
      USING (true);

    -- Allow public to select active services
    CREATE POLICY "Public can view active services"
      ON public.services
      FOR SELECT
      TO anon
      USING (is_active = true);

    RAISE NOTICE 'Services table created successfully';
  ELSE
    RAISE NOTICE 'Services table already exists';
  END IF;
END;
$$;