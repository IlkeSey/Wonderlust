-- Add theme column to podcasts
alter table public.podcasts add column if not exists theme text;

-- Update seed data with themes
update public.podcasts set theme = 'storytelling' where title = 'Radiolab';
update public.podcasts set theme = 'design' where title = '99% Invisible';
update public.podcasts set theme = 'technology' where title = 'Reply All';
