-- ============================================================
-- ToReadList — Fix profiles.pending_tag_link_id foreign key
-- ============================================================

-- Drop the existing constraint that blocks deletion of links
alter table public.profiles drop constraint if exists profiles_pending_tag_link_id_fkey;

-- Re-add the constraint with ON DELETE SET NULL
alter table public.profiles
  add constraint profiles_pending_tag_link_id_fkey
  foreign key (pending_tag_link_id)
  references public.links(id)
  on delete set null;
