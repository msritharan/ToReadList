-- ============================================================
-- ToReadList — Initial Database Schema
-- ============================================================

-- 1. Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  whatsapp_phone text unique,
  reminder_frequency text default 'off',
  reminder_time time default '09:00',
  timezone text default 'UTC',
  created_at timestamptz default now()
);

-- 2. Links table
create table public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  url text not null,
  title text,
  description text,
  favicon_url text,
  domain text,
  content_type text,
  extraction_status text default 'pending',
  source text default 'manual',
  status text default 'unread',
  is_favorite boolean default false,
  reading_time_mins int,
  read_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Indexes
create index idx_links_user_status on links(user_id, status, created_at desc);
create index idx_links_user_favorite on links(user_id, is_favorite) where is_favorite = true;
create index idx_links_domain on links(user_id, domain);

-- 4. Row-Level Security — Profiles
alter table profiles enable row level security;

create policy "Users see own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- 5. Row-Level Security — Links
alter table links enable row level security;

create policy "Users see own links"
  on links for select using (auth.uid() = user_id);

create policy "Users insert own links"
  on links for insert with check (auth.uid() = user_id);

create policy "Users update own links"
  on links for update using (auth.uid() = user_id);

create policy "Users delete own links"
  on links for delete using (auth.uid() = user_id);

-- 6. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Auto-update updated_at timestamp on links
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_links_updated_at
  before update on links
  for each row execute procedure public.update_updated_at_column();
