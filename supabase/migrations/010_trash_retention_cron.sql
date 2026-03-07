-- ============================================================
-- ToReadList — Trash retention (7-day purge) via pg_cron
-- ============================================================
-- This schedules a daily DB-side purge of links that have been in
-- the trash for more than 7 days.

-- 1) Enable pg_cron (if supported in this Supabase project)
create extension if not exists pg_cron;

-- 2) Purge function (runs with definer privileges so it can bypass RLS)
create or replace function public.purge_old_trash()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.links
  where deleted_at is not null
    and deleted_at < (now() - interval '7 days');
$$;

-- 3) Schedule daily job (idempotent: create only if missing)
do $$
begin
  if not exists (
    select 1
    from cron.job
    where jobname = 'purge_old_trash_daily'
  ) then
    perform cron.schedule(
      'purge_old_trash_daily',
      '15 3 * * *', -- 03:15 UTC daily
      $cmd$select public.purge_old_trash();$cmd$
    );
  end if;
end
$$;

