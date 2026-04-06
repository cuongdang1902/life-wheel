# Feature: Theme

Chứa toàn bộ cấu hình về mặt hiển thị giao diện Dark / Light Mode toàn cục.

## Kiến trúc
- **ThemeContext.jsx**: Giữ context theme hiện tại, tự động lấy tùy chọn từ OS preferences (`prefers-color-scheme: dark`). Lưu localStorage.
- **ThemeToggle.jsx**: Nút bấm UI hình mặt trời/mặt trăng ở góc trên màn hình.
