-- Run in Supabase SQL Editor if image upload fails (bucket missing)
-- Or use: npm run import:images (creates bucket automatically)

insert into storage.buckets (id, name, public)
values ('lure-images', 'lure-images', true)
on conflict (id) do update set public = true;

create policy "Public read lure images"
on storage.objects for select
using (bucket_id = 'lure-images');

create policy "Admin upload lure images"
on storage.objects for insert
with check (bucket_id = 'lure-images' and auth.role() = 'authenticated');

create policy "Admin update lure images"
on storage.objects for update
using (bucket_id = 'lure-images' and auth.role() = 'authenticated');

create policy "Admin delete lure images"
on storage.objects for delete
using (bucket_id = 'lure-images' and auth.role() = 'authenticated');
