-- Run in Supabase SQL Editor before import:columns
alter table columns add column if not exists meta_description text;
alter table columns alter column id drop default;
alter table columns alter column id type text using id::text;
