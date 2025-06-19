# Happy-Birthday-Website 🎂

Website tương tác mã nguồn mở giúp bạn tổ chức, ghi nhớ và chia sẻ ngày sinh nhật theo cách vui nhộn: đếm ngược, bánh 3D thổi nến, album ảnh/video, minigame, chat cộng đồng, đổi giao diện theo mùa/lễ hội và nhiều hơn thế nữa.

## Các Tính Năng Chính ✨

- 🎉 **Đếm ngược sinh nhật**: Hiển thị thời gian còn lại đến ngày sinh nhật tiếp theo trong nhóm
- 🎂 **Bánh sinh nhật tương tác**: Bánh 3 tầng đẹp mắt với nến
- 🎮 **Trò chơi giải trí**:
  - Trò chơi Trí nhớ (đang phát triển)
  - Trò chơi Ghép hình (đang phát triển)
- 📸 **Album ảnh**: Xem và chia sẻ những khoảnh khắc đáng nhớ
- 🎵 **Trình phát nhạc**: Phát nhạc sinh nhật
- 🎈 **Tính năng tương tác**:
  - Thổi nến bằng microphone
  - Hiệu ứng pháo hoa
  - Hiệu ứng bóng bay 
- 📱 **Chia sẻ mạng xã hội**: Chia sẻ lên Facebook, Twitter và Instagram
## Lợi Ích Của Dự Án 🌟

1. **Kết nối tình bạn**:
   - Giúp nhóm bạn luôn nhớ và không bỏ lỡ ngày sinh nhật của nhau
   - Tạo không gian chia sẻ và giao tiếp thường xuyên
   - Gắn kết tình bạn qua việc cùng nhau tổ chức và tham gia các hoạt động

2. **Lưu giữ kỷ niệm**:
   - Album ảnh kỹ thuật số giúp lưu trữ những khoảnh khắc đẹp
   - Dễ dàng xem lại và chia sẻ những kỷ niệm đáng nhớ
   - Tạo bộ sưu tập kỷ niệm chung của nhóm

3. **Tương tác và giải trí**:
   - Các trò chơi tương tác giúp tạo không khí vui vẻ
   - Tính năng thổi nến độc đáo tạo trải nghiệm thực tế
   - Hiệu ứng đẹp mắt làm tăng sự hấp dẫn

4. **Tiện ích thực tế**:
   - Đếm ngược tự động giúp không bỏ lỡ ngày sinh nhật
   - Dễ dàng chia sẻ niềm vui lên mạng xã hội
   - Giao diện thân thiện, dễ sử dụng

5. **Tính cộng đồng**:
   - Tạo không gian chung cho nhóm bạn
   - Khuyến khích sự tham gia của mọi thành viên
   - Tăng cường tương tác giữa các thành viên

## Công Nghệ Sử Dụng 💻

- HTML5
- CSS3
- JavaScript (Thuần)
- Web Audio API
- Canvas API
- Local Storage

## Hướng Dẫn Sử Dụng 🚀

1. Tải về mã nguồn:
```bash
git clone [đường-dẫn-repository]
```

2. Mở file `index.html` trong trình duyệt web

3. Cho phép sử dụng microphone khi được yêu cầu để sử dụng tính năng "Thổi nến"

## Thiết Lập Phát Triển 🛠️

```bash
# Cài dependencies
npm install

# Kiểm tra và tự động sửa style
npm run lint -- --fix
npm run format
```

## Tích Hợp Liên Tục (CI) ⚙️

Repo sử dụng GitHub Actions để tự động chạy ESLint và Prettier trên mỗi push hoặc pull request. Kết quả sẽ hiển thị dưới dạng dấu ✅ / ❌ ngay trên PR.

## Tùy Chỉnh 🎨

### Thêm Sinh Nhật Mới
Chỉnh sửa mảng `birthdays` trong file `script.js`:
```javascript
{
    name: "Tên",
    month: 1-12,
    day: 1-31,
    message: "Lời chúc sinh nhật của bạn"
}
```

### Thêm Ảnh
Đặt ảnh của bạn vào thư mục `memory/` để thêm vào album ảnh.

## Hỗ Trợ Trình Duyệt 🌐

- Chrome 
- Firefox
- Safari
- Edge

## Đóng Góp 🤝

1. Fork và clone repo
2. Tạo nhánh mới từ `main`:
```bash
git checkout -b feature/ten-tinh-nang
```
3. Thực hiện thay đổi, đảm bảo chạy:
```bash
npm run lint -- --fix
npm run format
```
4. Commit & push, mở Pull Request kèm mô tả rõ ràng.

Chúng tôi hoan nghênh mọi ý tưởng, issue và PR!

## Giấy Phép 📄

Dự án này được phân phối dưới giấy phép [MIT](LICENSE).

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

Được tạo với ❤️ cho những ngày sinh nhật đặc biệt!
