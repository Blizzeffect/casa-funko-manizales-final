-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON posts;
DROP POLICY IF EXISTS "Admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;

-- Create policies for posts table
-- Allow everyone to read posts
CREATE POLICY "Public posts are viewable by everyone" 
ON posts FOR SELECT 
USING (true);

-- Allow authenticated users (admins) to insert, update, delete
CREATE POLICY "Admins can insert posts" 
ON posts FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update posts" 
ON posts FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete posts" 
ON posts FOR DELETE 
USING (auth.role() = 'authenticated');

-- Storage Policies for 'posts' bucket
-- Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies for posts bucket to avoid conflicts
DROP POLICY IF EXISTS "Public Access Posts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Posts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Posts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Posts" ON storage.objects;

-- Create policies for posts bucket
-- Allow public read access
CREATE POLICY "Public Access Posts"
ON storage.objects FOR SELECT
USING ( bucket_id = 'posts' );

-- Allow authenticated upload
CREATE POLICY "Authenticated Upload Posts"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'posts' AND auth.role() = 'authenticated' );

-- Allow authenticated update
CREATE POLICY "Authenticated Update Posts"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'posts' AND auth.role() = 'authenticated' );

-- Allow authenticated delete
CREATE POLICY "Authenticated Delete Posts"
ON storage.objects FOR DELETE
USING ( bucket_id = 'posts' AND auth.role() = 'authenticated' );
