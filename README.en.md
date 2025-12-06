# Website Chúc Mừng Sinh Nhật - Kết Nối Niềm Vui

> **Website tương tác mã nguồn mở đầy sáng tạo** giúp bạn tổ chức, ghi nhớ và chia sẻ sinh nhật của bạn bè một cách vui vẻ và độc đáo! Từ đếm ngược thời gian thực, thổi nến bánh sinh nhật 2D, album ảnh/video, mini game, chat thời gian thực, đến các chủ đề theo mùa - mang đến trải nghiệm sinh nhật khó quên!

[![English](https://img.shields.io/badge/lang-English-blue)](README.en.md)
[![日本語](https://img.shields.io/badge/lang-日本語-red)](README.ja.md)

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-❤️-ff69b4" alt="Made with Love">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/Version-2.0.0-brightgreen" alt="Version 2.0.0">
  <img src="https://img.shields.io/badge/Next.js-16.0.7-black" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Database-Supabase-green" alt="Supabase">
  <img src="https://img.shields.io/badge/Deploy-Vercel-black" alt="Deploy with Vercel">
</p>

## 🌟 Tính Năng Chính

### 🎂 Tính Năng Cốt Lõi
| **Tính Năng**                | **Mô Tả**                                                                |
|------------------------------|--------------------------------------------------------------------------|
| 🎉 **Đếm Ngược Thời Gian Thực** | Lấy dữ liệu sinh nhật từ Supabase, hiển thị thời gian còn lại đến sinh nhật tiếp theo |
| 🎂 **Bánh Sinh Nhật Tương Tác** | Bánh 2D đẹp mắt, thổi nến bằng micro (sử dụng Framer Motion)       |
| 🎵 **Trình Phát Nhạc**       | Sử dụng Howler.js, tự động phát nhạc sinh nhật, tải nhạc tùy chỉnh         |
| 🎈 **Hiệu Ứng Hình Ảnh**     | Pháo giấy, pháo hoa, bóng bay (sử dụng Framer Motion)                     |

### 📸 Tính Năng Album & Media
| **Tính Năng**                | **Mô Tả**                                                                |
|------------------------------|--------------------------------------------------------------------------|
| 📸 **Album Ảnh & Video**     | Quản lý media với Supabase Storage, gắn thẻ, tìm kiếm, slideshow       |
| 🏷️ **Hệ Thống Tag**         | Gắn thẻ cho file media, tìm kiếm và lọc theo thẻ               |
| ⬆️ **Tải Lên Media**         | Tải trực tiếp ảnh/video (giới hạn 50MB, dùng react-dropzone)             |
| 🔍 **Tìm Kiếm**              | Tìm kiếm nhanh theo thẻ, lọc thời gian thực                         |

### 🎮 Game & Giải Trí
| **Tính Năng**                | **Mô Tả**                                                                |
|------------------------------|--------------------------------------------------------------------------|
| 🧠 **Game Lật Thẻ**          | Game ghép thẻ trí nhớ, lưu điểm với Zustand                        |
| 🧩 **Game Xếp Hình**         | Ghép hình jigsaw từ ảnh, điều chỉnh độ khó                               |
| ❓ **Đố Vui Sinh Nhật**      | Câu đố về sinh nhật có thể tùy chỉnh                                       |
| 📅 **Lịch Sinh Nhật**        | Hiển thị sinh nhật theo tháng, giao diện lịch trực quan                         |

### 💬 Tính Năng Cộng Đồng & Mạng Xã Hội
| **Tính Năng**                | **Mô Tả**                                                                |
|------------------------------|--------------------------------------------------------------------------|
| 💬 **Chat Thời Gian Thực**   | Sử dụng Supabase Realtime, lưu tên người dùng (localStorage)           |
| 📋 **Bảng Tin Chúc Mừng**    | Đăng tin công khai, thích, trả lời                                     |
| 🎙️ **Tin Nhắn Thoại**       | Ghi âm trên trình duyệt, lưu và phát tin nhắn thoại                               |
| 📹 **Tin Nhắn Video**        | Quay video webcam, lưu và phát tin nhắn video                             |
| 🎁 **Quà Tặng Ảo**           | Hệ thống chọn và gửi quà số (8 loại quà)                        |
| ✉️ **Mời Bạn Bè**            | Chia sẻ lên mạng xã hội                                               |

### 🎭 Chủ Đề & Tùy Chỉnh
| **Tính Năng**                | **Mô Tả**                                                                |
|------------------------------|--------------------------------------------------------------------------|
| 🌸 **Chủ Đề Theo Mùa**       | Tự động chuyển đổi: Xuân (hoa anh đào), Hạ, Thu (lá vàng), Đông (tuyết)                         |
| 🎄 **Chủ Đề Lễ Hội**         | Giáng sinh, Halloween, Hanami, Obon, Tanabata, Tsukimi, Kodomo no Hi, Bunkanohi... nhiều chủ đề |
| 🎬 **Nền Video**             | Video nền theo chủ đề, có fallback                               |
| ✨ **Hiệu Ứng Hạt**          | Lá rơi, hoa rơi, tuyết, đèn lồng, pháo hoa                       |
| 🌐 **Đa Ngôn Ngữ**           | Hỗ trợ Tiếng Anh và Tiếng Nhật, chuyển đổi động                     |

## Lợi Ích Tuyệt Vời Của Dự Án 💖

1. **Tăng Cường Tình Bạn**:
   - Không bao giờ quên sinh nhật của bạn bè.
   - Thúc đẩy giao lưu và chia sẻ trong không gian chung.
   - Kết nối mọi người qua sự kiện sinh nhật ý nghĩa.

2. **Lưu Giữ Kỷ Niệm Mãi Mãi**:
   - Lưu trữ những khoảnh khắc đẹp bằng ảnh và video trong album số.
   - Dễ dàng xem lại và chia sẻ với bạn bè, gia đình.
   - Xây dựng bộ sưu tập chung của nhóm.

3. **Giải Trí Vui Vẻ & Tương Tác**:
   - Nâng cao không khí chúc mừng với game và hiệu ứng.
   - Ghi lại khoảnh khắc đặc biệt với tính năng tin nhắn video.
   - Thu hút sự quan tâm của người dùng với hiệu ứng hình ảnh.

4. **Tiện Lợi Thực Tế**:
   - Nhắc nhở những ngày quan trọng với đếm ngược tự động.
   - Chia sẻ niềm vui lên mạng xã hội chỉ với một cú click.
   - Giao diện dễ sử dụng cho mọi lứa tuổi.

5. **Xây Dựng Cộng Đồng Vững Mạnh**:
   - Tạo không gian chung để tham gia và đóng góp.
   - Khuyến khích tương tác tích cực giữa các thành viên.
   - Tăng cường kết nối qua tin nhắn và quà tặng.

## Công Nghệ Sử Dụng

### Frontend
| Công Nghệ | Phiên Bản | Mô Tả |
|------|-----------|------|
| **Next.js** | 16.0.7 | App Router, hỗ trợ React Compiler |
| **React** | 19.2.0 | Tính năng React mới nhất |
| **TypeScript** | 5.0 | Phát triển an toàn kiểu |
| **Tailwind CSS** | 4.0 | CSS utility-first |
| **Framer Motion** | 12.23.25 | Animation |
| **Zustand** | 5.0.9 | Quản lý state (hỗ trợ persist) |
| **TanStack Query** | 5.90.12 | Quản lý state server |
| **Howler.js** | 2.2.4 | Phát nhạc |
| **react-dropzone** | 14.3.8 | Upload file |
| **date-fns** | 4.1.0 | Xử lý ngày tháng |

### Backend
| Công Nghệ | Mô Tả |
|------|------|
| **Supabase** | Cơ sở dữ liệu PostgreSQL |
| **Supabase Storage** | Lưu trữ file media |
| **Supabase Realtime** | Tính năng thời gian thực |
| **Next.js API Routes** | RESTful API |

### Công Cụ Phát Triển
| Công Nghệ | Mô Tả |
|------|------|
| **Vitest** | Framework testing |
| **Testing Library** | Test component |
| **ESLint** | Chất lượng code |
| **Prettier** | Format code |

## Hướng Dẫn Bắt Đầu

### Yêu Cầu
- Node.js 18 trở lên
- npm hoặc yarn
- Tài khoản Supabase

### 1. Tải Source Code
```bash
git clone https://github.com/yourusername/happy-birthday-website.git
cd happy-birthday-website
```

### 2. Cài Đặt Dependencies
```bash
npm install
# hoặc
yarn install
```

### 3. Cấu Hình Biến Môi Trường
```bash
cp .env.example .env.local
```

Chỉnh sửa file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Thiết Lập Database
Tham khảo [DATABASE.md](./DATABASE.md) để tạo các bảng cần thiết:
- `birthdays` - Thông tin sinh nhật
- `custom_messages` - Tin nhắn
- `media_files` - File media
- `virtual_gifts` - Quà tặng ảo
- `audio_messages` - Tin nhắn thoại
- `video_messages` - Tin nhắn video
- `bulletin_posts` - Bài đăng bảng tin
- `bulletin_replies` - Trả lời bảng tin

### 5. Khởi Động Server Dev
```bash
npm run dev
# hoặc
yarn dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

### 6. Triển Khai

#### Triển Khai Vercel (Khuyến Nghị)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fhappy-birthday-website&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20configuration%20required&envLink=https%3A%2F%2Fsupabase.io%2F)

**Triển Khai Thủ Công:**
1. Import project vào [Vercel](https://vercel.com/)
2. Cấu hình Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL project Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
3. Build và deploy tự động hoàn tất!

## Biến Môi Trường và Bảo Mật

### Biến Môi Trường Cần Thiết
| Tên Biến | Mô Tả | Ví Dụ |
|--------|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiI...` |

### Lưu Ý Bảo Mật
- ✅ **An toàn**: Anonymous keys dùng cho public
- ✅ **An toàn**: URL là thông tin công khai  
- ❌ **Nguy hiểm**: Tuyệt đối không public Service role key hoặc password
- ✅ **RLS**: Bật Row Level Security trong Supabase

## Cấu Trúc Dự Án 💻

```
happy-birthday-website/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── birthdays/        # API sinh nhật
│   │   ├── messages/         # API tin nhắn
│   │   ├── media/            # API media
│   │   ├── gifts/            # API quà tặng
│   │   ├── audio/            # API âm thanh
│   │   ├── video/            # API video
│   │   └── upload/           # API upload
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Trang chủ
│   └── globals.css           # CSS toàn cục
├── components/
│   ├── ui/                   # Component UI
│   │   ├── Button.tsx        # Nút bấm
│   │   ├── Modal.tsx         # Modal
│   │   ├── MusicPlayer.tsx   # Trình phát nhạc
│   │   └── ...
│   ├── features/             # Component tính năng
│   │   ├── BirthdayCake.tsx  # Bánh sinh nhật
│   │   ├── CountdownTimer.tsx # Đếm ngược
│   │   ├── PhotoGallery.tsx  # Thư viện ảnh
│   │   └── ...
│   ├── community/            # Tính năng cộng đồng
│   │   ├── ChatRoom.tsx      # Phòng chat
│   │   ├── BulletinBoard.tsx # Bảng tin
│   │   ├── GiftSelector.tsx  # Chọn quà
│   │   └── ...
│   ├── games/                # Game
│   │   ├── MemoryGame.tsx    # Game lật thẻ
│   │   ├── PuzzleGame.tsx    # Game xếp hình
│   │   ├── BirthdayQuiz.tsx  # Đố vui
│   │   └── BirthdayCalendar.tsx # Lịch sinh nhật
│   ├── effects/              # Hiệu ứng hình ảnh
│   │   ├── FallingPetals.tsx # Hoa rơi
│   │   ├── FallingSnow.tsx   # Tuyết rơi
│   │   ├── FallingLeaves.tsx # Lá rơi
│   │   ├── FloatingLanterns.tsx # Đèn lồng
│   │   └── VideoBackground.tsx # Nền video
│   └── layout/               # Layout
│       └── MainLayout.tsx    # Layout chính
├── lib/
│   ├── hooks/                # Custom hooks
│   │   ├── useBirthdayCheck.ts
│   │   ├── useMessages.ts
│   │   ├── useMusicPlayer.ts
│   │   └── ...
│   ├── stores/               # Zustand stores
│   │   ├── birthdayStore.ts
│   │   ├── themeStore.ts
│   │   ├── musicStore.ts
│   │   └── gameStore.ts
│   ├── supabase/             # Supabase client
│   ├── providers/            # React providers
│   └── i18n/                 # Đa ngôn ngữ
├── config/
│   ├── themes.ts             # Cấu hình 16 chủ đề
│   └── music.ts              # Cấu hình nhạc
├── types/                    # Định nghĩa TypeScript
├── __tests__/                # File test
├── public/                   # File tĩnh
│   ├── video/                # Video nền theo chủ đề
│   └── audio/                # File nhạc
└── package.json              # Dependencies
```

Chi tiết xem [STRUCTURE.md](./STRUCTURE.md).

## Lệnh NPM

| Lệnh | Mô Tả |
|---------|------|
| `npm run dev` | Khởi động server dev |
| `npm run build` | Build production |
| `npm run start` | Khởi động server production |
| `npm run lint` | Kiểm tra ESLint |
| `npm run test` | Chạy test |
| `npm run test:watch` | Chế độ watch test |
| `npm run test:coverage` | Báo cáo coverage |

## Trình Duyệt Hỗ Trợ 

- **Google Chrome** (Khuyến nghị)
- **Mozilla Firefox**
- **Apple Safari**
- **Microsoft Edge**

## Tài Liệu

| Tài Liệu | Mô Tả |
|-------------|------|
| [STRUCTURE.md](./STRUCTURE.md) | Chi tiết cấu trúc dự án |
| [DATABASE.md](./DATABASE.md) | Schema database |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Hướng dẫn đóng góp |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Quy tắc ứng xử (Code of Conduct) |

## Đóng Góp 

Chúng tôi hoan nghênh mọi đóng góp để làm dự án tốt hơn! Vui lòng làm theo các bước sau:

1. **Fork và Clone Repository**:
   - Fork dự án và clone về local.

2. **Tạo Branch Mới**:
   ```bash
   git checkout -b feature/ten-tinh-nang
   ```

3. **Thực Hiện Thay Đổi**:
   - Viết code, sửa bug, hoặc thêm tính năng mới.
   - Duy trì type safety của TypeScript.
   - Thêm test.

4. **Commit và Push**:
   - Commit thay đổi và push lên repository của bạn.
   - Mở **Pull Request** với mô tả chi tiết.

> 💡 **Lưu ý**: Chúng tôi hoan nghênh ý tưởng, báo cáo lỗi (issue), và pull request! Cùng nhau xây dựng cộng đồng sáng tạo và gắn kết!

## Giấy Phép 

Dự án này được phân phối dưới **giấy phép [MIT](LICENSE)** - tự do sử dụng, chỉnh sửa và chia sẻ.

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
</p>

---

<p align="center">
  <strong>Được tạo với ❤️ cho những sinh nhật đặc biệt và những người bạn thân yêu!</strong>
</p>
