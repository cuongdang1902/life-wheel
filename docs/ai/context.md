# Project Context for AI

## Project Overview
- **Name**: Life Wheel (🎡 Bánh xe cuộc sống)
- **Goal**: Giúp người dùng đánh giá sự cân bằng trong 8 lĩnh vực cuộc sống và đặt mục tiêu cải thiện.
- **Tech Stack**: 
  - Frontend: React (Vite)
  - Styling: TailwindCSS
  - Icons/UI: Lucide React (hoặc tương đương)
  - Backend: Supabase (Auth, Database - Đang trong quá trình đồng bộ)

## Core Features
1. **Bánh xe SVG**: Hiển thị radar chart 8 lĩnh vực.
2. **Snapshot System**: Lưu lịch sử đánh giá theo chu kỳ (Tháng/Quý/Năm).
3. **Goal Tracking**: Mỗi lĩnh vực có tối đa 3 tiểu mục tiêu (sub-goals) và 3 đầu việc (tasks).
4. **Auth**: Đăng nhập qua Google và Email.

## Database Schema (Planned)
- `profiles`: Lưu thông tin user mở rộng.
- `snapshots`: Lưu điểm số radar.
- `goals`: Lưu các mục tiêu và task.
