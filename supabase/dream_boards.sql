-- ==========================================
-- Dream Board Table
-- Chạy trong Supabase SQL Editor
-- ==========================================

create table public.dream_boards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null default auth.uid(),
  title text not null,
  image_url text,
  affirmation text,
  area_id text,
  status text default 'active' check (status in ('active', 'achieved')),
  sort_order integer default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.dream_boards enable row level security;

create policy "Users can view their own dream boards."
  on dream_boards for select
  using (auth.uid() = user_id);

create policy "Users can insert their own dream boards."
  on dream_boards for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own dream boards."
  on dream_boards for update
  using (auth.uid() = user_id);

create policy "Users can delete their own dream boards."
  on dream_boards for delete
  using (auth.uid() = user_id);

-- ==========================================
-- Bucket List Table
-- ==========================================

create table public.bucket_list (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null default auth.uid(),
  year integer not null,
  title text not null,
  description text,
  area_id text,
  status text default 'pending' check (status in ('pending', 'completed')),
  sort_order integer default 0,
  completed_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.bucket_list enable row level security;

create policy "Users can view their own bucket list."
  on bucket_list for select
  using (auth.uid() = user_id);

create policy "Users can insert their own bucket list."
  on bucket_list for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own bucket list."
  on bucket_list for update
  using (auth.uid() = user_id);

create policy "Users can delete their own bucket list."
  on bucket_list for delete
  using (auth.uid() = user_id);

-- ==========================================
-- Shares Table
-- ==========================================

create table public.shares (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users not null,
  shared_with_id uuid references auth.users not null,
  feature text not null check (feature in ('wheel', 'dreamboard', 'bucketlist')),
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique(owner_id, shared_with_id, feature)
);

alter table public.shares enable row level security;

-- Owner xem tất cả shares của mình
create policy "Owners can view their shares."
  on shares for select
  using (auth.uid() = owner_id OR auth.uid() = shared_with_id);

create policy "Owners can create shares."
  on shares for insert
  with check (auth.uid() = owner_id);

create policy "Shared user can update status (accept/reject)."
  on shares for update
  using (auth.uid() = shared_with_id OR auth.uid() = owner_id);

create policy "Owners can delete shares."
  on shares for delete
  using (auth.uid() = owner_id);

-- ==========================================
-- Updated RLS: Allow shared access on dream_boards
-- ==========================================
create policy "Accepted shares can view dream boards."
  on dream_boards for select
  using (
    auth.uid() = user_id
    OR exists (
      select 1 from public.shares
      where owner_id = dream_boards.user_id
        and shared_with_id = auth.uid()
        and feature = 'dreamboard'
        and status = 'accepted'
    )
  );

-- ==========================================
-- Updated RLS: Allow shared access on bucket_list
-- ==========================================
create policy "Accepted shares can view bucket list."
  on bucket_list for select
  using (
    auth.uid() = user_id
    OR exists (
      select 1 from public.shares
      where owner_id = bucket_list.user_id
        and shared_with_id = auth.uid()
        and feature = 'bucketlist'
        and status = 'accepted'
    )
  );
