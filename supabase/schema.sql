-- Seeing Stars Agency: database schema
-- Run this whole file once in Supabase: SQL Editor → New query → paste → Run.

-- ============ TABLES ============

create table if not exists public.intake_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lang text not null default 'en',
  artist_name text not null,
  email text not null,
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new','converted','archived')),
  artist_id uuid
);

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  legal_name text,
  email text not null,
  lang text not null default 'en' check (lang in ('en','es')),
  packages text[] not null default '{}',
  single_title text,
  release_date date,
  intake_id uuid references public.intake_submissions(id) on delete set null,
  user_id uuid unique references auth.users(id) on delete set null,
  closed_at date,
  intake_answers jsonb,          -- Launchpad questionnaire, filled in by the artist in their dashboard
  intake_done_at timestamptz
);
alter table public.artists add column if not exists intake_answers jsonb;
alter table public.artists add column if not exists intake_done_at timestamptz;

alter table public.intake_submissions
  drop constraint if exists intake_submissions_artist_fk;
alter table public.intake_submissions
  add constraint intake_submissions_artist_fk foreign key (artist_id) references public.artists(id) on delete set null;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'artist' check (role in ('admin','artist')),
  artist_id uuid references public.artists(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.artist_steps (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  step_key text not null,
  start_status text not null check (start_status in ('had','missing')),
  status text not null check (status in ('had','done','in_progress','pending')),
  done_on date,
  updated_at timestamptz not null default now(),
  unique (artist_id, step_key)
);

create table if not exists public.next_steps (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  owner text not null check (owner in ('artist','agency')),
  body text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  happens_on date not null,
  body text not null,
  done boolean not null default false
);

create table if not exists public.artist_files (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  name text not null,
  path text not null,
  created_at timestamptz not null default now()
);

create index if not exists artist_steps_artist on public.artist_steps(artist_id);
create index if not exists next_steps_artist on public.next_steps(artist_id);
create index if not exists notes_artist on public.notes(artist_id);
create index if not exists milestones_artist on public.milestones(artist_id);
create index if not exists files_artist on public.artist_files(artist_id);

-- ============ HELPERS ============

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.my_artist_id() returns uuid
language sql stable security definer set search_path = public as $$
  select artist_id from public.profiles where id = auth.uid();
$$;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.my_artist_id() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.my_artist_id() to authenticated;

-- ============ SECURITY (row level security) ============
-- Artists can only READ their own rows. Only the admin can change anything.
-- Questionnaire submissions are saved by the website server, never directly by visitors.

alter table public.intake_submissions enable row level security;
alter table public.artists enable row level security;
alter table public.profiles enable row level security;
alter table public.artist_steps enable row level security;
alter table public.next_steps enable row level security;
alter table public.notes enable row level security;
alter table public.milestones enable row level security;
alter table public.artist_files enable row level security;

drop policy if exists "admin all" on public.intake_submissions;
create policy "admin all" on public.intake_submissions for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read own or admin" on public.profiles;
create policy "read own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());

drop policy if exists "read own" on public.artists;
create policy "read own" on public.artists for select using (id = public.my_artist_id());
drop policy if exists "admin all" on public.artists;
create policy "admin all" on public.artists for all using (public.is_admin()) with check (public.is_admin());

do $$
declare t text;
begin
  foreach t in array array['artist_steps','next_steps','notes','milestones','artist_files'] loop
    execute format('drop policy if exists "read own" on public.%I', t);
    execute format('create policy "read own" on public.%I for select using (artist_id = public.my_artist_id())', t);
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- ============ ACCESS FOR THE WEBSITE ============
-- Logged-in users may reach these tables; the security rules above decide which rows.
-- Visitors who are not logged in get nothing (the questionnaire is saved by the server).
grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.my_artist_id() to authenticated;
revoke all on all tables in schema public from anon;

-- ============ FILE STORAGE ============
-- Private bucket. Downloads go through the website, which checks who is asking.
insert into storage.buckets (id, name, public)
values ('artist-files', 'artist-files', false)
on conflict (id) do nothing;
