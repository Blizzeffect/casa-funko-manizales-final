-- Add customer_details column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_details JSONB DEFAULT '{}'::jsonb;
