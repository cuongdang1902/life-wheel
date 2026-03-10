# Feature: Goals

DOM quản lý các mục tiêu cải thiện theo 8 lĩnh vực (Areas) trên Life Wheel.

## Kiến trúc
- **useGoals.js**: Custom hook quản lý state Goals (lưu tạm ở localStorage). Gồm các hàm thêm/sửa/xóa task và sub-goal.
- **GoalsModal.jsx**: Giao diện chính để tạo mới, chỉnh sửa trực tiếp các mục tiêu và công việc (tasks).
- **GoalsDashboard.jsx**: Giao diện tổng quan dạng Kanban/List hiển thị tiến độ % hoàn thành các lĩnh vực.

## Rule
- Dữ liệu ở đây sẽ được migrate lên Supabase, hiện tại cấu trúc lưu trữ gồm `period` > `areaId` > `subGoals` > `tasks`.
