# Supabase Setup Guide

## 1. Tạo project Supabase

1. Truy cập [supabase.com](https://supabase.com) và đăng nhập
2. Nhấn "New Project"
3. Điền thông tin:
   - **Name**: life-wheel
   - **Database Password**: tạo password mạnh
   - **Region**: chọn region gần nhất
4. Nhấn "Create new project"

## 2. Lấy API Keys

1. Vào **Project Settings** > **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

## 3. Cấu hình environment

Tạo file `.env` trong thư mục gốc project:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Cấu hình Authentication

1. Vào **Authentication** > **Providers**
2. Đảm bảo **Email** provider đã được bật
3. (Tùy chọn) Tắt "Confirm email" nếu muốn test nhanh:
   - Vào **Authentication** > **Settings**
   - Tắt "Enable email confirmations"

## 5. Chạy ứng dụng

```bash
npm run dev
```

Truy cập http://localhost:5173 và đăng ký tài khoản mới!

## Lưu ý

- Không commit file `.env` lên git (đã có trong .gitignore)
- Giữ bí mật `SUPABASE_ANON_KEY` của bạn
- Có thể cấu hình thêm OAuth (Google, GitHub...) trong Supabase Dashboard
