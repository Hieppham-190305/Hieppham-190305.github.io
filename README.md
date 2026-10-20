# Quà sinh nhật dành cho Thư

Trang tĩnh, không cần bước build. GitHub Pages phục vụ trực tiếp nhánh `main`.

## Thay ảnh và nội dung

Sửa `gift-content.js`:

- `signature`: chữ ký trong thư và ảnh thiệp tải về (hiện dùng mẫu **Hiệp**).
- `letter`: lời nhắn riêng; dùng `\n\n` để xuống đoạn.
- `memories`: danh sách ảnh và chú thích. Ba khung hiện dùng cùng ảnh đại diện để minh họa.
  - `image`: đường dẫn ảnh, ví dụ `assets/ky-niem-1.jpg`, hoặc URL ảnh.
  - `caption`: chú thích dưới ảnh.
  - `position`: vị trí cắt ảnh, ví dụ `50% 50%`.

Có thể thêm khung thứ 4, thứ 5 vào danh sách `memories`. Ảnh xuất hiện trước bánh kem, tự chuyển sau 4,2 giây; có nút lùi, tiến và bỏ qua.

Ảnh đại diện nằm ở `index.html` (`img#logo`). Thay riêng nếu muốn ảnh đại diện khác ảnh kỷ niệm.

## Luồng hiển thị

Mở quà → lời chúc bằng hạt → ảnh kỷ niệm → bánh kem → ngôi sao điều ước → thiệp và thư riêng.

Chạm ảnh đại diện để hiện lời trêu. Nút lưu thiệp tạo ảnh PNG 1200 × 1600 ngay trong trình duyệt; trên điện thoại có thể chạm giữ ảnh xem trước để lưu. Ảnh PNG chứa lời thư và chữ ký, không tải ảnh bên ngoài vào canvas.

Nhạc được tạo bằng Web Audio, chỉ bật sau khi chạm mở quà. Có nút bật/tắt nhạc và nút xem lại. Thời gian mỗi câu chúc: laptop 3 giây, điện thoại 4 giây.
