-- Live Studio: initial schema (Phase 1)
-- Tables: profiles, production_sessions, cameras, stream_destinations, recordings
-- All tables have RLS enabled; rows are only visible to their owner.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Create a profile automatically when a user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- production_sessions
-- ---------------------------------------------------------------------------
create table public.production_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'ready', 'archived')),
  -- Switcher state (which camera is on preview / program). Persisted, no video yet.
  preview_camera_id uuid,
  program_camera_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index production_sessions_owner_idx on public.production_sessions (owner_id, created_at desc);

create trigger production_sessions_updated_at before update on public.production_sessions
  for each row execute function public.set_updated_at();

alter table public.production_sessions enable row level security;

create policy "sessions_select_own" on public.production_sessions
  for select using ((select auth.uid()) = owner_id);
create policy "sessions_insert_own" on public.production_sessions
  for insert with check ((select auth.uid()) = owner_id);
create policy "sessions_update_own" on public.production_sessions
  for update using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "sessions_delete_own" on public.production_sessions
  for delete using ((select auth.uid()) = owner_id);

-- ---------------------------------------------------------------------------
-- cameras (camera slots belonging to a session)
-- ---------------------------------------------------------------------------
create table public.cameras (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.production_sessions(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  join_token text not null unique
    default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  -- 'offline' = join page closed, 'online' = join page open on a device.
  -- This is presence only; it does not mean video is being transported.
  status text not null default 'offline' check (status in ('offline', 'online')),
  device_label text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cameras_session_idx on public.cameras (session_id);
create index cameras_owner_idx on public.cameras (owner_id);

create trigger cameras_updated_at before update on public.cameras
  for each row execute function public.set_updated_at();

alter table public.cameras enable row level security;

create policy "cameras_select_own" on public.cameras
  for select using ((select auth.uid()) = owner_id);
create policy "cameras_insert_own" on public.cameras
  for insert with check (
    (select auth.uid()) = owner_id
    and exists (select 1 from public.production_sessions s
                where s.id = session_id and s.owner_id = (select auth.uid()))
  );
create policy "cameras_update_own" on public.cameras
  for update using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "cameras_delete_own" on public.cameras
  for delete using ((select auth.uid()) = owner_id);

-- Switcher references must point at cameras of the same session.
alter table public.production_sessions
  add constraint sessions_preview_camera_fk foreign key (preview_camera_id)
    references public.cameras(id) on delete set null,
  add constraint sessions_program_camera_fk foreign key (program_camera_id)
    references public.cameras(id) on delete set null;

-- Public (anon) access for the camera join page, via the secret join token only.
create or replace function public.get_camera_by_token(p_token text)
returns table (camera_id uuid, camera_name text, session_name text)
language sql security definer set search_path = public stable as $$
  select c.id, c.name, s.name
  from public.cameras c
  join public.production_sessions s on s.id = c.session_id
  where c.join_token = p_token
  limit 1;
$$;

create or replace function public.set_camera_presence(p_token text, p_online boolean, p_device_label text default null)
returns boolean
language plpgsql security definer set search_path = public as $$
declare updated int;
begin
  update public.cameras
     set status = case when p_online then 'online' else 'offline' end,
         device_label = coalesce(p_device_label, device_label),
         last_seen_at = now()
   where join_token = p_token;
  get diagnostics updated = row_count;
  return updated > 0;
end;
$$;

revoke all on function public.get_camera_by_token(text) from public;
revoke all on function public.set_camera_presence(text, boolean, text) from public;
grant execute on function public.get_camera_by_token(text) to anon, authenticated;
grant execute on function public.set_camera_presence(text, boolean, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- stream_destinations (metadata only; stream keys are NOT stored in this phase)
-- ---------------------------------------------------------------------------
create table public.stream_destinations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.production_sessions(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  platform text not null default 'custom_rtmp'
    check (platform in ('youtube', 'twitch', 'facebook', 'custom_rtmp')),
  rtmp_url text not null default '',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index stream_destinations_session_idx on public.stream_destinations (session_id);

create trigger stream_destinations_updated_at before update on public.stream_destinations
  for each row execute function public.set_updated_at();

alter table public.stream_destinations enable row level security;

create policy "destinations_select_own" on public.stream_destinations
  for select using ((select auth.uid()) = owner_id);
create policy "destinations_insert_own" on public.stream_destinations
  for insert with check (
    (select auth.uid()) = owner_id
    and exists (select 1 from public.production_sessions s
                where s.id = session_id and s.owner_id = (select auth.uid()))
  );
create policy "destinations_update_own" on public.stream_destinations
  for update using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "destinations_delete_own" on public.stream_destinations
  for delete using ((select auth.uid()) = owner_id);

-- ---------------------------------------------------------------------------
-- recordings (metadata; media files will live in the private "recordings" bucket)
-- ---------------------------------------------------------------------------
create table public.recordings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.production_sessions(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  storage_path text,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  status text not null default 'processing' check (status in ('processing', 'ready', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recordings_owner_idx on public.recordings (owner_id, created_at desc);
create index recordings_session_idx on public.recordings (session_id);

create trigger recordings_updated_at before update on public.recordings
  for each row execute function public.set_updated_at();

alter table public.recordings enable row level security;

create policy "recordings_select_own" on public.recordings
  for select using ((select auth.uid()) = owner_id);
create policy "recordings_insert_own" on public.recordings
  for insert with check ((select auth.uid()) = owner_id);
create policy "recordings_update_own" on public.recordings
  for update using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "recordings_delete_own" on public.recordings
  for delete using ((select auth.uid()) = owner_id);

-- Private storage bucket; objects are namespaced as <user_id>/<...>.
insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', false)
on conflict (id) do nothing;

create policy "recordings_objects_select_own" on storage.objects
  for select using (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "recordings_objects_insert_own" on storage.objects
  for insert with check (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "recordings_objects_delete_own" on storage.objects
  for delete using (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ---------------------------------------------------------------------------
-- Realtime: studio listens to camera + session changes
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.cameras;
alter publication supabase_realtime add table public.production_sessions;
