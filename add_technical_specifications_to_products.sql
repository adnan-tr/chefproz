-- Add technical specification fields to products table
-- This migration adds frequency, voltage, power, capacity, and weight fields

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS hz NUMERIC,
ADD COLUMN IF NOT EXISTS voltage NUMERIC,
ADD COLUMN IF NOT EXISTS power NUMERIC,
ADD COLUMN IF NOT EXISTS litre NUMERIC,
ADD COLUMN IF NOT EXISTS kg NUMERIC;

-- Add comments to describe the fields
COMMENT ON COLUMN products.hz IS 'Frequency in Hertz (Hz)';
COMMENT ON COLUMN products.voltage IS 'Voltage in Volts (V)';
COMMENT ON COLUMN products.power IS 'Power in Watts (W)';
COMMENT ON COLUMN products.litre IS 'Capacity in Litres (L)';
COMMENT ON COLUMN products.kg IS 'Weight in Kilograms (kg)';

-- Create indexes for better query performance on these fields
CREATE INDEX IF NOT EXISTS idx_products_hz ON products(hz) WHERE hz IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_voltage ON products(voltage) WHERE voltage IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_power ON products(power) WHERE power IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_litre ON products(litre) WHERE litre IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_kg ON products(kg) WHERE kg IS NOT NULL;