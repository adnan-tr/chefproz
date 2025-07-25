-- Create company_details table for storing company information
CREATE TABLE IF NOT EXISTS company_details (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL DEFAULT 'ChefGear Pro',
  logo TEXT,
  description TEXT DEFAULT 'Professional kitchen equipment and solutions',
  website TEXT DEFAULT 'https://chefgear.com',
  email TEXT DEFAULT 'info@chefgear.com',
  phone TEXT DEFAULT '+90 (212) 555-1234',
  address TEXT DEFAULT 'Atatürk Mah. Ertuğrul Gazi Sok. No: 25, Kat: 3, 34758 Ataşehir/İstanbul',
  social_media JSONB DEFAULT '{"facebook": "https://facebook.com/chefgear", "twitter": "https://twitter.com/chefgear", "instagram": "https://instagram.com/chefgear", "linkedin": "https://linkedin.com/company/chefgear"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_company_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE company_details ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to company details" ON company_details
  FOR SELECT USING (true);

CREATE POLICY "Allow admin update access to company details" ON company_details
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND role IN ('supermanager', 'manager')
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_company_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_details_updated_at
  BEFORE UPDATE ON company_details
  FOR EACH ROW
  EXECUTE FUNCTION update_company_details_updated_at();

-- Insert default company details if not exists
INSERT INTO company_details (id, name, description, website, email, phone, address, social_media)
VALUES (
  1,
  'ChefGear Pro',
  'Professional kitchen equipment and solutions for modern culinary operations',
  'https://chefgear.com',
  'info@chefgear.com',
  '+90 (212) 555-1234',
  'Atatürk Mah. Ertuğrul Gazi Sok. No: 25, Kat: 3, 34758 Ataşehir/İstanbul',
  '{"facebook": "https://facebook.com/chefgear", "twitter": "https://twitter.com/chefgear", "instagram": "https://instagram.com/chefgear", "linkedin": "https://linkedin.com/company/chefgear"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;