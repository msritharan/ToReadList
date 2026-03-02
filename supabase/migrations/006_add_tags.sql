-- ============================================================
-- ToReadList — Add Tags to Links
-- ============================================================

-- 1. Add tags column as text array
alter table public.links add column if not exists tags text[] default '{}';

-- 2. Add GIN index for efficient tag filtering (only on tags column)
create index if not exists idx_links_tags on links using gin(tags);

-- 3. Add pending tag state to profiles (for Telegram conversation)
alter table public.profiles add column if not exists pending_tag_link_id uuid references public.links(id);
