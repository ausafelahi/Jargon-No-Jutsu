-- Jargon no Jutsu — initial schema (PRD v2.0)

create extension if not exists "pgcrypto";

-- users: Supabase Auth already provides auth.users.
-- This table mirrors PRD's public "users" entity for app-level joins.
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  character_name text not null,
  anime_name text not null,
  image_url text,
  concept text not null,
  lesson text not null,
  career_advice text not null,
  created_at timestamptz not null default now()
);

create index if not exists lessons_created_at_idx on public.lessons (created_at desc);
create index if not exists lessons_character_idx on public.lessons (character_name);
create index if not exists lessons_anime_idx on public.lessons (anime_name);
create index if not exists lessons_concept_idx on public.lessons (concept);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now()
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.lessons enable row level security;
alter table public.bookmarks enable row level security;
alter table public.subscribers enable row level security;

-- lessons: public read (published content), writes restricted to service role only
create policy "lessons_public_read" on public.lessons
  for select using (true);

-- users: a user can read/update only their own row
create policy "users_self_select" on public.users
  for select using (auth.uid() = id);

create policy "users_self_update" on public.users
  for update using (auth.uid() = id);

-- bookmarks: a user can manage only their own bookmarks
create policy "bookmarks_owner_select" on public.bookmarks
  for select using (auth.uid() = user_id);

create policy "bookmarks_owner_insert" on public.bookmarks
  for insert with check (auth.uid() = user_id);

create policy "bookmarks_owner_delete" on public.bookmarks
  for delete using (auth.uid() = user_id);

-- subscribers: inserts open (public signup), no public read/update/delete
create policy "subscribers_public_insert" on public.subscribers
  for insert with check (true);

-- Auto-create a public.users row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
