create table if not exists public.instrumental_tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  artist text check (artist is null or char_length(artist) <= 120),
  file_path text not null unique,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.instrumental_tracks enable row level security;

grant select on public.instrumental_tracks to anon, authenticated;
grant insert, delete on public.instrumental_tracks to authenticated;

drop policy if exists "Public can read instrumental tracks" on public.instrumental_tracks;
create policy "Public can read instrumental tracks"
  on public.instrumental_tracks for select to anon, authenticated
  using (true);

drop policy if exists "Admins can manage instrumental tracks" on public.instrumental_tracks;
create policy "Admins can manage instrumental tracks"
  on public.instrumental_tracks for all to authenticated
  using ((select public.is_app_admin()))
  with check ((select public.is_app_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('instrumentals', 'instrumentals', true, 26214400, array['audio/mpeg'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view instrumentals" on storage.objects;
create policy "Public can view instrumentals"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'instrumentals');

drop policy if exists "Admins can manage instrumentals" on storage.objects;
create policy "Admins can manage instrumentals"
  on storage.objects for all to authenticated
  using (bucket_id = 'instrumentals' and (select public.is_app_admin()))
  with check (bucket_id = 'instrumentals' and (select public.is_app_admin()));
