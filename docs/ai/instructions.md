# Development Instructions for AI

Khi làm việc với dự án này, AI cần tuân thủ các quy tắc sau:

## 1. Công nghệ & Style
- Sử dụng **TailwindCSS** cho mọi thành phần giao diện.
- Viết **Functional Components** với React Hooks.
- Giữ logic trong các custom hooks (VD: `useSnapshots`, `useGoals`).

## 2. Supabase Usage
- Sử dụng client từ `src/lib/supabase.js`.
- Không lưu các dữ liệu nhạy cảm vào code (dùng biến môi trường `.env`).
- Mọi truy vấn database phải đi kèm xử lý lỗi (error handling).

## 3. UI/UX Guidelines
- Đảm bảo hỗ trợ cả Dark Mode và Light Mode (sử dụng `isDark` từ `ThemeContext`).
- Ưu tiên các hiệu ứng transition mượt mà và thiết kế hiện đại, sạch sẽ.
- Responsive cho thiết bị di động là bắt buộc.
