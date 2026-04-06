# Feature: Snapshots

DOM quản lý việc lưu vết điểm số trên Life Wheel qua các thời kỳ (tháng, quý, năm) để theo dõi xu hướng phát triển bản thân.

## Kiến trúc
- **useSnapshots.js**: Custom hook kết nối với DB (hoặc localStorage) để lưu điểm.
- **SaveSnapshotModal.jsx**: Form nhỏ xác nhận việc lưu điểm số ở thời điểm hiện tại.
- **SnapshotModal.jsx**: Dashboard quản lý danh sách snapshot cũ. Trích xuất nút bấm chọn so sánh nát đứt với bánh xe hiện tại.
