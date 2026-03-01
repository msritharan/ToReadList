-- ============================================================
-- Migration: Add Telegram verification columns to profiles
-- ============================================================

-- Verification flag
alter table public.profiles
  add column if not exists telegram_verified boolean default false;

-- One-time link token (used during /start flow)
alter table public.profiles
  add column if not exists telegram_link_token text unique;

-- Token expiry
alter table public.profiles
  add column if not exists telegram_link_expires_at timestamptz;
