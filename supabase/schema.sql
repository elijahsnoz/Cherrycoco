-- Cherry Coco — Supabase schema
-- Run this once in your Supabase project: Dashboard → SQL Editor → New query → paste → Run.
-- It creates the stories table, a public "covers" image bucket, and security rules so
-- the public can only READ published stories while only the logged-in owner can write.

-- 1) Stories table -----------------------------------------------------------
create table if not exists public.stories (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  author          text not null default 'Cherry Coco',
  category        text not null default 'personal-growth',
  region          text default '',
  reading_minutes integer not null default 5,
  image_url       text default '',
  summary         text default '',
  body            text default '',
  published       boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- keep updated_at fresh on every change
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists stories_touch_updated_at on public.stories;
create trigger stories_touch_updated_at
  before update on public.stories
  for each row execute function public.touch_updated_at();

-- 2) Row Level Security ------------------------------------------------------
alter table public.stories enable row level security;

-- Anyone (even logged-out readers) can read PUBLISHED stories
drop policy if exists "read published" on public.stories;
create policy "read published"
  on public.stories for select
  using ( published = true );

-- The logged-in owner can read everything (incl. drafts)
drop policy if exists "owner read all" on public.stories;
create policy "owner read all"
  on public.stories for select to authenticated
  using ( true );

-- The logged-in owner can create / edit / delete
drop policy if exists "owner insert" on public.stories;
create policy "owner insert"
  on public.stories for insert to authenticated
  with check ( true );

drop policy if exists "owner update" on public.stories;
create policy "owner update"
  on public.stories for update to authenticated
  using ( true );

drop policy if exists "owner delete" on public.stories;
create policy "owner delete"
  on public.stories for delete to authenticated
  using ( true );

-- 3) Cover image storage -----------------------------------------------------
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

-- Anyone can view cover images; only the logged-in owner can upload/replace
drop policy if exists "covers public read" on storage.objects;
create policy "covers public read"
  on storage.objects for select
  using ( bucket_id = 'covers' );

drop policy if exists "covers owner write" on storage.objects;
create policy "covers owner write"
  on storage.objects for insert to authenticated
  with check ( bucket_id = 'covers' );

drop policy if exists "covers owner update" on storage.objects;
create policy "covers owner update"
  on storage.objects for update to authenticated
  using ( bucket_id = 'covers' );

-- NOTE: after running this, go to Authentication → Providers → Email and turn
-- OFF "Enable sign-ups" so nobody but your manually-created account can log in
-- and write. Create your owner account under Authentication → Users → Add user.
