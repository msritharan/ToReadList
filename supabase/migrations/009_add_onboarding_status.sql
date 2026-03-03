-- ============================================================
-- ToReadList — Add onboarding status to profiles
-- ============================================================

-- Add the has_seen_onboarding column
alter table public.profiles
  add column has_seen_onboarding boolean default false;

-- Mark all existing users as having seen the onboarding
-- so we don't interrupt them. Only truly new users will have 'false'.
update public.profiles
set has_seen_onboarding = true;
