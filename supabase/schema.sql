-- Run this entire file in Supabase SQL Editor
create extension if not exists pgcrypto;

create table if not exists lures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  maker text not null,
  size_mm integer,
  weight_g numeric(5,1),
  price_yen integer,
  hook_size text,
  lure_type text not null,
  sinking_type text,
  fall_posture text,
  fall_type text,
  range_min_cm numeric(5,1),
  range_max_cm numeric(5,1),
  swim_posture text not null,
  speed_range text not null,
  casting_distance text not null,
  youtube_url text,
  amazon_url text,
  rakuten_url text,
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists lure_images (
  id uuid primary key default gen_random_uuid(),
  lure_id uuid references lures(id) on delete cascade,
  storage_path text,
  external_url text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists lure_bachi_types (
  lure_id uuid references lures(id) on delete cascade,
  bachi_type text not null,
  primary key (lure_id, bachi_type)
);

create table if not exists columns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  body text not null,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table lures enable row level security;
alter table lure_images enable row level security;
alter table lure_bachi_types enable row level security;
alter table columns enable row level security;

create policy "Public read lures" on lures for select using (true);
create policy "Public read lure_images" on lure_images for select using (true);
create policy "Public read lure_bachi_types" on lure_bachi_types for select using (true);
create policy "Public read columns" on columns for select using (true);

create policy "Admin write lures" on lures
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Admin write lure_images" on lure_images
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Admin write lure_bachi_types" on lure_bachi_types
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Admin write columns" on columns
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

