# Feature: Core Life Wheel

Feature cốt lõi nhất của dự án, vẽ biểu đồ SVG 8 múi tượng trưng cho sự cân bằng cuộc sống.

## Kiến trúc
- **LifeWheel.jsx**: SVG Logic nặng nề nhất, tự vẽ vector lines & dots. Cho phép drag points để update điểm số 0-10. Cấu hình mảng hằng số `AREAS` gốc nằm ở đây.
- **ExportModal.jsx**: Tính năng kết xuất Bánh xe SVG thành ảnh PNG (cho user chia sẻ) hoặc tải về. Phụ thuộc thư viện `html-to-image`.
