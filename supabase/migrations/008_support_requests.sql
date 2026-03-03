-- ============================================================
-- ToReadList — Support Requests
-- ============================================================

-- 1. Create table
create table if not exists public.support_requests (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    email text not null,
    category text not null default 'support'
        check (category in ('support', 'feature_request', 'bug_report', 'other')),
    message text not null check (char_length(message) <= 2000),
    created_at timestamptz not null default now()
);

-- 2. RLS
alter table public.support_requests enable row level security;

-- Allow authenticated users to insert their own requests
create policy "Users can insert own support requests"
    on public.support_requests for insert
    to authenticated
    with check (auth.uid() = user_id);
