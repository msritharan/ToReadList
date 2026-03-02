-- ============================================================
-- ToReadList — Soft Delete / Trash
-- ============================================================

-- 1. Add deleted_at column to links (NULL = not deleted)
ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Partial index for fast trash queries
CREATE INDEX IF NOT EXISTS idx_links_trash
  ON public.links(user_id, deleted_at DESC)
  WHERE deleted_at IS NOT NULL;