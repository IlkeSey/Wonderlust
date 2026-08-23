-- Podcast Club schema
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

create table if not exists public.podcasts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  url         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Keep updated_at fresh on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists podcasts_set_updated_at on public.podcasts;
create trigger podcasts_set_updated_at
  before update on public.podcasts
  for each row execute function public.set_updated_at();

-- Row Level Security: public read/write (no auth in this app).
alter table public.podcasts enable row level security;

drop policy if exists "podcasts_public_select" on public.podcasts;
create policy "podcasts_public_select" on public.podcasts
  for select using (true);

drop policy if exists "podcasts_public_insert" on public.podcasts;
create policy "podcasts_public_insert" on public.podcasts
  for insert with check (true);

drop policy if exists "podcasts_public_update" on public.podcasts;
create policy "podcasts_public_update" on public.podcasts
  for update using (true) with check (true);

drop policy if exists "podcasts_public_delete" on public.podcasts;
create policy "podcasts_public_delete" on public.podcasts
  for delete using (true);

create index if not exists podcasts_created_at_idx on public.podcasts (created_at desc);

-- Optional seed data
insert into public.podcasts (title, description, url)
values
  ('Radiolab', 'Investigating a strange world through sound and story.', 'https://radiolab.org'),
  ('99% Invisible', 'All the thought that goes into the things we do not think about.', 'https://99percentinvisible.org'),
  ('Reply All', 'A show about the internet and modern life.', 'https://gimletmedia.com/shows/reply-all')
on conflict do nothing;
