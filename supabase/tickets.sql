-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create a ticket (public support form)
CREATE POLICY "Anyone can create tickets" ON tickets
  FOR INSERT WITH CHECK (true);

-- Policy: Only admins can view/update tickets
-- (Assuming admins are authenticated users for now, or specific role if implemented)
CREATE POLICY "Admins can view tickets" ON tickets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update tickets" ON tickets
  FOR UPDATE USING (auth.role() = 'authenticated');
