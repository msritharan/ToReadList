-- ============================================================
-- Migration: WhatsApp → Telegram
-- Renames whatsapp_phone to telegram_chat_id in profiles table
-- ============================================================

-- Drop the unique constraint on whatsapp_phone (if any)
alter table public.profiles drop constraint if exists profiles_whatsapp_phone_key;

-- Rename the column
alter table public.profiles rename column whatsapp_phone to telegram_chat_id;

-- Re-add the unique constraint with the new name
alter table public.profiles add constraint profiles_telegram_chat_id_key unique (telegram_chat_id);
