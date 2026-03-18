# 📜 Life Wheel - Project Development History

Tài liệu này ghi lại toàn bộ quá trình phát triển, các quyết định quan trọng và tiến độ của dự án **Life Wheel**. Đây là bản tóm tắt chi tiết thay thế cho lịch sử chat kỹ thuật để bạn có thể theo dõi và đọc lại bất cứ khi nào.

---

## 🏗️ Giai đoạn 1: Refactor Kiến trúc & Nền tảng (Phase 1)
*Thời gian: Tháng 3/2026*

### 1.1 Tái cấu trúc theo Feature-Based Architecture
- **Vấn đề**: Code cũ tập trung quá nhiều vào `App.jsx`, các component lồng nhau phức tạp và khó bảo trì.
- **Giải pháp**: Chuyển đổi sang mô hình **Feature-Based**. Chia dự án thành các module độc lập:
  - `features/wheel`: Core logic của vòng xoay SVG và chấm điểm.
  - `features/snapshots`: Hệ thống lưu trữ lịch sử đánh giá.
  - `features/goals`: Hệ thống mục tiêu (OKR) và quản lý task.
  - `features/auth`: Xác thực người dùng (Supabase Auth).
  - `features/theme`: Quản lý giao diện Sáng/Tối.
  - `shared/`: Các UI components dùng chung (Button, Input, Card...).

### 1.2 Dockerization & Dev Environment
- Thiết lập `Dockerfile` và `docker-compose.yml` để chạy ứng dụng trong môi trường container đồng nhất.
- Sử dụng Node 20-Alpine làm base image để tối ưu dung lượng.
- Sửa lỗi Hot Reload khi chạy Docker trên Windows.

### 1.3 Tích hợp Supabase (Backend)
- Chuyển đổi từ `localStorage` thuần túy sang **Supabase PostgreSQL**.
- Thiết lập Table Schema:
  - `snapshots`: Lưu điểm radar (scroring) theo chu kỳ.
  - `goals`: Lưu Objective và các Key Results (sub-goals/tasks).
- Cơ chế **Hybrid Storage**: Ưu tiên lưu lên Cloud (nếu đã đăng nhập), nếu chưa đăng nhập sẽ lưu vào `localStorage` và tự động đồng bộ khi login.

---

## ✨ Giai đoạn 2: Nâng cấp UX & Routing (Phase 2)
*Thời gian: Hiện tại*

### 2.1 React Router Integration
- Chuyển đổi từ ứng dụng Modal-based sang **Multi-page Application (SPA)** dùng `react-router-dom`.
- Các Route chính:
  - `/` (Home): Life Wheel & Controls.
  - `/snapshots`: Quản lý và xem lại lịch sử đánh giá.
  - `/goals`: Thiết lập OKR (Mục tiêu & Tiểu mục tiêu).
  - `/dashboard`: Theo dõi tiến độ tổng quan realtime.

### 2.2 AppLayout & Navigation System
- **User Header**: 
  - Hiển thị thông tin người dùng (Avatar + Tên) từ Supabase Metadata.
  - Dropdown menu hiện đại để quản lý tài khoản và Đăng xuất.
- **Bottom Navigation (Mobile UI)**:
  - Thiết kế thanh điều hướng dính ở đáy màn hình (Bottom Bar) giống ứng dụng di động.
  - Giúp trải nghiệm trên điện thoại mượt mà và dễ chạm hơn.
- **Sidebar (Desktop UI)**:
  - Tích hợp thanh Sidebar bên trái cho màn hình lớn để tối ưu không gian hiển thị rộng.

### 2.3 Xử lý sự cố & Tối ưu
- **Sửa lỗi Blank Screen (Trắng trang)**: Phát hiện và xử lý lỗi thiếu thư viện `react-router-dom` trong Docker container bằng cách `rebuild` và `clean install`.
- **Tối ưu Mobile Wheel**: Điều chỉnh Label Radius cho SVG Wheel để text không bị tràn trên màn hình nhỏ.

---

## 🐛 Giai đoạn 3: Bug Fixes & UX Improvements — Goals (OKR)
*Thời gian: 18/03/2026*

### 3.1 Fix Bug: Mục tiêu Tháng hiển thị nhầm nội dung Quý

- **Vấn đề**: Khi đang ở chế độ chỉnh sửa mục tiêu (`editingObjective = true`) rồi chuyển sang tab/period khác, state `editingObjective` không được reset → ô input vẫn hiển thị nội dung của period cũ thay vì period mới.
- **Nguyên nhân gốc**: Không có cơ chế reset trạng thái khi người dùng thay đổi context (Năm/Quý/Tháng/Lĩnh vực).
- **Fix ban đầu**: Dùng `useEffect` theo dõi `periodKey` và `selectedArea` để reset.

### 3.2 Fix Bug: Lưu nhầm mục tiêu của lĩnh vực khác

- **Vấn đề**: Khi đang edit mục tiêu của lĩnh vực A, chuyển sang lĩnh vực B (form vẫn mở do bug 3.1), bấm ✓ → lưu nội dung của A vào lĩnh vực B trong Supabase.
- **Biểu hiện**: Chuyển sang "Sức khỏe" thấy hiển thị mục tiêu của "Phát triển bản thân".
- **Fix triệt để**: Thay `useEffect` (chạy sau render — không đủ nhanh) bằng hàm **`resetInputs()`** chạy đồng bộ trong **mọi event handler** điều hướng:
  - Click tab Năm / Quý / Tháng
  - Đổi lĩnh vực (Area dropdown)
  - Đổi năm / quý / tháng
  - Click card Quý (từ view Năm)
  - Click card Tháng (từ view Quý)
- `resetInputs()` reset toàn bộ: `editingObjective`, `objectiveInput`, `newSubGoalTitle`, `newTaskTexts`, `confirmClear`.

### 3.3 Thêm tính năng: Xóa mục tiêu (clearGoal)

- **Lý do**: Sau khi data bị lưu nhầm vào Supabase (do bug 3.2), cần cách để user tự sửa mà không phải vào DB.
- **Thêm `clearGoal(period, areaId)`** vào `useGoals.js`:
  - Xóa row khỏi **Supabase** (nếu đã đăng nhập và tồn tại `_supabaseId`).
  - Xóa key khỏi **local state** (và `localStorage` nếu chưa đăng nhập).
- **Thêm nút 🗑️** vào header card objective, với cơ chế **xác nhận 2 lần** (click lần 1 → "⚠️ Xác nhận xóa?", click lần 2 → thực sự xóa) để tránh bấm nhầm.

### 3.4 Thêm tính năng: Copy button (giống ChatGPT)

- **Vị trí**: Xuất hiện ở mọi nơi có hiển thị nội dung goal:
  | Vị trí | Hiển thị | Kích thước |
  |---|---|---|
  | Card Mục tiêu chính (Năm/Quý/Tháng) | Luôn hiển thị khi có nội dung | `w-7 h-7` |
  | Card Quý (view Năm) | Ẩn, hiện khi hover card | `w-6 h-6` |
  | Card Tháng (view Quý) | Ẩn, hiện khi hover card | `w-6 h-6` |
  | Sub-goal title | Ẩn, hiện khi hover card sub-goal | `w-6 h-6` |
  | Task text | Ẩn, hiện khi hover row task | `w-5 h-5` |
- **UX**: Icon copy SVG (Lucide-style) → chuyển thành checkmark SVG trong **2 giây** → tự reset. Dùng `copiedKey` state để track item nào vừa được copy.
- **Kỹ thuật**: `e.stopPropagation()` để click copy không kích hoạt `onClick` của card cha. Dùng Tailwind **group nesting** (`group/sg`, `group/task`) để hover độc lập giữa các cấp.

---

## 📈 Lộ trình Tiếp theo (Phase 4)
- [x] **Trend Chart**: Biểu đồ hình sin/đường thẳng hiển thị xu hướng phát triển qua các chu kỳ (đã có trong màn hình Snapshots).
- [x] **Sharing System**: Xuất ảnh PNG (Wheel) hoặc link chia sẻ cho bạn bè (đã có ở trang chủ vòng xoay).
- [ ] **AI Coach**: Tích hợp Gemini API để phân tích điểm số và đưa ra lời khuyên cải thiện cuộc sống.
- [ ] **Reminders**: Thông báo nhắc nhở cập nhật điểm số hàng tháng.

---
*Cập nhật lần cuối: 18/03/2026 bởi Antigravity AI*
