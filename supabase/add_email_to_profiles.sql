-- ==========================================
-- MIGRATION: Thêm cột email vào profiles
-- Chạy file này TRƯỚC dream_boards.sql
-- ==========================================

-- 1. Thêm cột email vào profiles
alter table public.profiles
  add column if not exists email text;

-- 2. Cập nhật trigger để lưu email khi user mới đăng ký
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;

-- 3. Backfill email cho các user đã tồn tại (nếu có)
-- Cần dùng service_role key hoặc chạy trực tiếp trong Supabase SQL editor
-- vì auth.users không accessible từ client
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and p.email is null;

-- 4. Index để tìm kiếm nhanh theo email
create index if not exists profiles_email_idx on public.profiles (email);

-- 5. Policy cho phép user tìm kiếm profile theo email (để invite bạn bè)
-- Profiles đã có policy "Mọi người có thể xem public profiles." (for select using true)
-- Nếu chưa có, thêm:
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles' and policyname = 'Public profiles are viewable by everyone.'
  ) then
    create policy "Public profiles are viewable by everyone."
      on profiles for select
      using (true);
  end if;
end
$$;
