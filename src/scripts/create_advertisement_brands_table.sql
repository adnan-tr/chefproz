-- Create advertisement_brands table for managing advertisement banners
CREATE TABLE IF NOT EXISTS advertisement_brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_advertisement_brands_active ON advertisement_brands(is_active);
CREATE INDEX IF NOT EXISTS idx_advertisement_brands_order ON advertisement_brands(display_order);
CREATE INDEX IF NOT EXISTS idx_advertisement_brands_dates ON advertisement_brands(start_date, end_date);

-- Add RLS (Row Level Security) policies
ALTER TABLE advertisement_brands ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (for displaying ads)
CREATE POLICY "Allow public read access to active brands" ON advertisement_brands
  FOR SELECT USING (is_active = true AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()));

-- Policy for authenticated users to manage brands (admin only)
CREATE POLICY "Allow authenticated users to manage brands" ON advertisement_brands
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert some sample data
INSERT INTO advertisement_brands (brand_name, logo_url, website_url, description, contact_email, display_order, is_active) VALUES
('Premium Kitchen Solutions', 'https://via.placeholder.com/100x100?text=PKS', 'https://example.com', 'Leading provider of commercial kitchen equipment', 'contact@pks.com', 1, true),
('Industrial Chef Pro', 'https://via.placeholder.com/100x100?text=ICP', 'https://example.com', 'Professional grade kitchen tools and appliances', 'info@industrialchef.com', 2, true),
('CoolTech Refrigeration', 'https://via.placeholder.com/100x100?text=CTR', 'https://example.com', 'Advanced refrigeration systems for commercial use', 'sales@cooltech.com', 3, true),
('HotelMax Equipment', 'https://via.placeholder.com/100x100?text=HME', 'https://example.com', 'Complete hotel and restaurant equipment solutions', 'contact@hotelmax.com', 4, true),
('Stainless Steel Masters', 'https://via.placeholder.com/100x100?text=SSM', 'https://example.com', 'Custom stainless steel fabrication specialists', 'info@ssm.com', 5, true),
('Energy Efficient Systems', 'https://via.placeholder.com/100x100?text=EES', 'https://example.com', 'Eco-friendly kitchen equipment and solutions', 'contact@ees.com', 6, true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_advertisement_brands_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_advertisement_brands_updated_at
  BEFORE UPDATE ON advertisement_brands
  FOR EACH ROW
  EXECUTE FUNCTION update_advertisement_brands_updated_at();