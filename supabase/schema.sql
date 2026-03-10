-- ==========================================
-- SUPABASE DATABASE SCHEMA & POLICIES
-- Copy toàn bộ nội dung này và chạy trong mục "SQL Editor" trên Supabase Dashboard.
-- ==========================================

-- 1. Tạo bảng profiles (Lưu thông tin tùy biến của user)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  website text,
  updated_at timestamp with time zone,

  -- Ràng buộc độ dài hiển thị đơn giản
  constraint full_name_length check (char_length(full_name) >= 3)
);

-- Bật Row Level Security (BẮT BUỘC để bảo mật dữ liệu trên Supabase)
alter table public.profiles enable row level security;

-- 2. Viết các Policies (Ai được làm gì)
-- a. Ai cũng xem được profile người khác (VD: để hiện tên tác giả bài post)
create policy "Mọi người có thể xem public profiles."
  on profiles for select
  using ( true );

-- b. User đăng nhập mới được thêm thông tin của chính họ
create policy "Người dùng có thể chèn profile của chính họ."
  on profiles for insert
  with check ( auth.uid() = id );

-- c. User đăng nhập mới được sửa profile của chính họ
create policy "Người dùng có thể tự sửa đổi profile."
  on profiles for update
  using ( auth.uid() = id );

-- 3. Tạo Trigger Tự Động: Khi có user mới Đăng ký ở hệ thống Auth, tự thêm bản ghi Profile rỗng
-- Tạo hàm thực thi
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Gắn Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 4. Bảng Snapshots (Lưu lịch sử bánh xe)
-- ==========================================
create table public.snapshots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null default auth.uid(),
  period text not null, -- 'month', 'quarter', 'year'
  scores jsonb not null, -- Lưu mảng điểm số { health: 7, career: 8... }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.snapshots enable row level security;

create policy "Users can only see their own snapshots." on snapshots
  for select using (auth.uid() = user_id);

create policy "Users can only insert their own snapshots." on snapshots
  for insert with check (auth.uid() = user_id);

create policy "Users can only delete their own snapshots." on snapshots
  for delete using (auth.uid() = user_id);

-- ==========================================
-- 5. Bảng Goals (Lưu mục tiêu)
-- ==========================================
create table public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null default auth.uid(),
  period text not null,
  area_id text not null,
  objective text,
  sub_goals jsonb default '[]'::jsonb, -- Chứa cấu hình lồng nhau của sub-tasks
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.goals enable row level security;

create policy "Users can only see their own goals." on goals
  for select using (auth.uid() = user_id);

create policy "Users can only insert/update their own goals." on goals
  for all using (auth.uid() = user_id);
