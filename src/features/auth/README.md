# Feature: Authentication

Thư mục này chứa toàn bộ components và logic liên quan đến xác thực người dùng.

## Kiến trúc
- **AuthContext.jsx**: React Context quản lý vòng đời Session của người dùng (từ Supabase). Export hook `useAuth()` cho toàn dự án dùng.
- **AuthModal.jsx**: Giao diện Modal Đăng nhập/Đăng ký. Tích hợp Email/Password và Login with Google OAuth.

## Lưu ý 
- Mọi tương tác backend phải gọi thông qua file cấu hình trung tâm tại `src/shared/lib/supabase.js`.
- Không lưu Password hoặc JWT Tokens ở local, để `supabaseClient` tự xử lý.
