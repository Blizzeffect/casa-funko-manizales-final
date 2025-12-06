-- Create radio_tracks table
create table if not exists public.radio_tracks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  artist text default 'Unknown Artist',
  file_url text not null,
  is_active boolean default true
);

-- Enable RLS
alter table public.radio_tracks enable row level security;

-- Policies for radio_tracks

-- Public Read: Everyone can see active tracks
create policy "Public tracks are viewable by everyone"
  on public.radio_tracks for select
  using (is_active = true);

-- Admin Full Access: Authenticated users (admins) can do everything
create policy "Authenticated users can manage tracks"
  on public.radio_tracks for all
  to authenticated
  using (true)
  with check (true);

-- Storage Policies for 'radio_music' bucket
-- Note: Buckets are usually created via the dashboard or seed scripts, 
-- but we can attempt to insert into storage.buckets if permissions allow, 
-- or assume user will create it if this fails. 
-- Best practice in SQL migrations often involves just setting policies if bucket exists.

insert into storage.buckets (id, name, public)
values ('radio_music', 'radio_music', true)
on conflict (id) do nothing;

create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'radio_music' );

create policy "Auth Upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'radio_music' );

create policy "Auth Delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'radio_music' );
