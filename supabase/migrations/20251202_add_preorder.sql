-- Add pre-order columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_preorder BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS release_date DATE DEFAULT NULL;

-- Update RLS policies if necessary (usually not needed for new columns if policy is on row level)
-- But good to ensure the public can read these columns
-- (Supabase "Select" policy usually covers all columns unless specified otherwise)
