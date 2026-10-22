create table if not exists public.app_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.shared_songs (
  id text primary key,
  song jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_activity (
  id bigint generated always as identity primary key,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.app_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_app_admin() from public;
grant execute on function public.is_app_admin() to authenticated;

alter table public.app_admins enable row level security;
alter table public.app_settings enable row level security;
alter table public.shared_songs enable row level security;
alter table public.admin_activity enable row level security;

grant select on public.app_admins to authenticated;
grant select on public.app_settings, public.shared_songs to anon, authenticated;
grant insert, update, delete on public.app_settings, public.shared_songs to authenticated;
grant select, insert on public.admin_activity to authenticated;
grant usage, select on sequence public.admin_activity_id_seq to authenticated;

create policy "Admins can read their own membership"
  on public.app_admins for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Public can read app settings"
  on public.app_settings for select to anon, authenticated
  using (true);
create policy "Admins can manage app settings"
  on public.app_settings for all to authenticated
  using ((select public.is_app_admin()))
  with check ((select public.is_app_admin()));

create policy "Public can read shared songs"
  on public.shared_songs for select to anon, authenticated
  using (true);
create policy "Admins can manage shared songs"
  on public.shared_songs for all to authenticated
  using ((select public.is_app_admin()))
  with check ((select public.is_app_admin()));

create policy "Admins can read activity"
  on public.admin_activity for select to authenticated
  using ((select public.is_app_admin()));
create policy "Admins can record activity"
  on public.admin_activity for insert to authenticated
  with check ((select public.is_app_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('branding', 'branding', true, 3145728, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view branding"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'branding');
create policy "Admins can upload branding"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'branding' and (select public.is_app_admin()));
create policy "Admins can update branding"
  on storage.objects for update to authenticated
  using (bucket_id = 'branding' and (select public.is_app_admin()))
  with check (bucket_id = 'branding' and (select public.is_app_admin()));
create policy "Admins can delete branding"
  on storage.objects for delete to authenticated
  using (bucket_id = 'branding' and (select public.is_app_admin()));
