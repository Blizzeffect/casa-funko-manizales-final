-- Create posts table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  image_url text,
  category text,
  reading_time text,
  published_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.posts enable row level security;

-- Create policies
create policy "Allow public read access" on public.posts
  for select using (true);

create policy "Allow authenticated insert" on public.posts
  for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated update" on public.posts
  for update using (auth.role() = 'authenticated');

-- Seed data (The 3 placeholder articles)
insert into public.posts (title, slug, excerpt, content, image_url, category, reading_time, published_at)
values
  (
    'Cómo organizar una habitación gaming con Funko Pops',
    'como-organizar-habitacion-gaming-funko',
    'Guía completa para decorar tu espacio gaming con estilo y funcionalidad',
    'Contenido completo del artículo aquí...',
    'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&q=80&w=1000',
    'Gaming',
    '8 min lectura',
    '2025-12-15 10:00:00+00'
  ),
  (
    'Top 10 Funko Pops más valiosos en 2025',
    'top-10-funko-pops-valiosos-2025',
    'Descubre cuáles son las figuras más cotizadas y por qué',
    'Contenido completo del artículo aquí...',
    'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&q=80&w=1000',
    'Coleccionismo',
    '12 min lectura',
    '2025-12-12 10:00:00+00'
  ),
  (
    'Iluminación LED perfecta para tu colección',
    'iluminacion-led-perfecta-coleccion',
    'Guía de tipos de luces y cómo instalarlas profesionalmente',
    'Contenido completo del artículo aquí...',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1000',
    'Diseño',
    '10 min lectura',
    '2025-12-10 10:00:00+00'
  )
on conflict (slug) do nothing;
