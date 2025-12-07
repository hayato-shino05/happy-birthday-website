# Birthday Celebration Website - A Platform to Connect Through Joy

> **A creative, interactive, open-source website** designed to help you remember, celebrate, and share birthdays with friends and family in fun and unique ways. Features real-time countdowns, interactive 2D birthday cake with blow-out candles, photo/video albums, mini-games, real-time chat, seasonal and festival themes, and more to create unforgettable birthday experiences.

[![日本語](https://img.shields.io/badge/lang-日本語-red)](README.md)

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

## 🌟 Key Features

### 🎂 Core Features

| **Feature**                        | **Description**                                                                 |
|------------------------------------|---------------------------------------------------------------------------------|
| 🎉 **Real-time Countdown**         | Fetches birthday data from Supabase and displays real-time countdown to next birthday |
| 🎂 **Interactive Birthday Cake**   | Cute 2D cake with blow-out candles effect using microphone (powered by Framer Motion) |
| 🎵 **Music Player**                | Birthday song playback using Howler.js with support for custom music uploads |
| 🎈 **Visual Effects**              | Confetti, fireworks, balloons and more (powered by Framer Motion) |

### 📸 Album & Media Features

| **Feature**                        | **Description**                                                                 |
|------------------------------------|---------------------------------------------------------------------------------|
| 📸 **Photo & Video Album**         | Media management using Supabase Storage with tagging, search, and slideshow |
| 🏷️ **Tag System**                  | Tag media files for easy search and filtering |
| ⬆️ **Media Upload**                | Direct image/video upload (50MB limit, using react-dropzone) |
| 🔍 **Search Function**             | Fast search by tags or text with real-time results |

### 🎮 Games & Entertainment

| **Feature**                        | **Description**                                                                 |
|------------------------------------|---------------------------------------------------------------------------------|
| 🧠 **Memory Game**                 | Flip cards to find matching pairs with score tracking via Zustand |
| 🧩 **Jigsaw Puzzle**               | Generate puzzles from any image with adjustable difficulty |
| ❓ **Birthday Quiz**               | Birthday-themed quiz with customizable questions |
| 📅 **Birthday Calendar**           | Calendar UI displaying birthdays by month |

### 💬 Community & Social Features

| **Feature**                        | **Description**                                                                 |
|------------------------------------|---------------------------------------------------------------------------------|
| 💬 **Real-time Chat**              | Chat using Supabase Realtime with username stored in localStorage |
| 📋 **Wish Message Board**          | Public message board with post, like, and reply features |
| 🎙️ **Voice Messages**             | Record and save audio messages directly in browser |
| 📹 **Video Messages**              | Capture and save video messages using webcam |
| 🎁 **Virtual Gifts**               | Send various types of digital gifts |
| ✉️ **Invite Friends**              | Easy URL sharing via social share buttons |

### 🎭 Themes & Customization

*Code includes Japanese and international themes.*

| **Feature**                        | **Description**                                                                 |
|------------------------------------|---------------------------------------------------------------------------------|
| 🌸 **Seasonal Themes**             | Auto-switching themes for Spring (cherry blossoms), Summer, Autumn (maple leaves), Winter (snow) |
| 🎄 **Festival & Event Themes**     | Christmas, Halloween, Hanami, Obon, Moon Viewing, Tanabata, New Year, Children's Day, Culture Day, etc. |
| 🎬 **Video Backgrounds**           | Theme-specific video backgrounds with fallback images |
| ✨ **Particle Effects**            | Cherry petals, maple leaves, snow, lanterns, fireworks matching each theme |
| 🌐 **Multi-language Support**      | English and Japanese support with dynamic UI switching |

## Value This Project Brings 💖

1. **Strengthen Connections with Friends & Family**
   - Never forget important birthdays
   - Share messages and memories in a common celebration space
   - Naturally increase communication around birthdays

2. **Preserve Memories Long-term**
   - Organize and save photos/videos in digital albums
   - Easy to revisit and share with family and friends anytime
   - Build a "shared memory collection" as a group

3. **Entertainment to Liven Up Celebrations**
   - Make online celebrations fun with games and effects
   - Capture genuine feelings with video messages
   - Create a "special feeling" with animated UI

4. **Highly Practical Features**
   - Auto countdown helps you prepare for important dates
   - One-click social media sharing
   - Simple UI accessible even for non-tech-savvy users

5. **Works as a Hub for Small Communities**
   - Can be used as a "common space" for teams, circles, or classes
   - Promote positive communication through messages and gifts
   - Open-source allows free customization for your community

## Technology Stack

### Frontend

| Technology | Version | Description |
|------------|---------|-------------|
| **Next.js** | 16.0.7 | App Router with React Compiler support |
| **React** | 19.2.0 | Latest React features |
| **TypeScript** | 5.0 | Type-safe development |
| **Tailwind CSS** | 4.0 | Utility-first styling |
| **Framer Motion** | 12.23.25 | Animation implementation |
| **Zustand** | 5.0.9 | Global state management with persistence |
| **TanStack Query** | 5.90.12 | Server state and cache management |
| **Howler.js** | 2.2.4 | Audio playback |
| **react-dropzone** | 14.3.8 | File upload UI |
| **date-fns** | 4.1.0 | Date/time handling |

### Backend

| Technology | Description |
|------------|-------------|
| **Supabase** | PostgreSQL-based BaaS |
| **Supabase Storage** | Media file storage |
| **Supabase Realtime** | Real-time subscription features |
| **Next.js API Routes** | RESTful API implementation |

### Development Tools

| Tool | Description |
|------|-------------|
| **Vitest** | Testing framework |
| **Testing Library** | React component testing |
| **ESLint** | Code quality checking |
| **Prettier** | Code formatter |

## Getting Started (Local Environment)

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/happy-birthday-website.git
cd happy-birthday-website
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Database Setup

See [DATABASE.md](./DATABASE.md) for detailed table and policy information. Main tables:

- `birthdays` - Birthday information
- `custom_messages` - Messages
- `media_files` - Media files
- `virtual_gifts` - Virtual gifts
- `audio_messages` - Voice messages
- `video_messages` - Video messages
- `bulletin_posts` - Bulletin board posts
- `bulletin_replies` - Bulletin board replies

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Deployment

#### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fhappy-birthday-website&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20configuration%20required&envLink=https%3A%2F%2Fsupabase.io%2F)

**Manual Deployment Steps:**

1. Import project to [Vercel](https://vercel.com/)
2. Configure Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
3. Vercel will automatically build and deploy

## Environment Variables & Security

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiI...` |

### Security Notes

- ✅ **Safe**: Anonymous key is a public key meant for frontend use
- ✅ **Safe**: URL itself is public information
- ❌ **Dangerous**: Never expose service role keys or passwords
- ✅ **RLS**: Enable Row Level Security in Supabase

## Project Structure 💻

See [STRUCTURE.md](./STRUCTURE.md) for detailed structure. Here's an overview:

```text
happy-birthday-website/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── birthdays/        # Birthday API
│   │   ├── messages/         # Messages API
│   │   ├── media/            # Media API
│   │   ├── gifts/            # Gifts API
│   │   ├── audio/            # Audio messages API
│   │   ├── video/            # Video messages API
│   │   └── upload/           # Upload API
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global CSS
├── components/
│   ├── ui/                   # UI components
│   ├── features/             # Birthday feature components
│   ├── community/            # Community features
│   ├── games/                # Games
│   ├── effects/              # Visual effects
│   └── layout/               # Layout
├── lib/
│   ├── hooks/                # Custom Hooks
│   ├── stores/               # Zustand stores
│   ├── supabase/             # Supabase client
│   ├── providers/            # React providers
│   └── i18n/                 # Internationalization
├── config/                   # Theme, music configs
├── types/                    # TypeScript type definitions
├── __tests__/                # Test code
├── public/                   # Static files (videos, audio, etc.)
└── package.json              # Dependencies and scripts
```

## npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |

## Browser Support

- **Google Chrome** (Recommended)
- **Mozilla Firefox**
- **Apple Safari**
- **Microsoft Edge**

## Documentation

| Document | Description |
|----------|-------------|
| [STRUCTURE.md](./STRUCTURE.md) | Detailed project structure |
| [DATABASE.md](./DATABASE.md) | Database schema details |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Code of conduct |

## Contributing

Contributions to this project are very welcome! Please follow these steps:

1. **Fork & Clone**
   - Fork the repository and clone it locally

2. **Create Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Implement & Fix**
   - Add features or fix bugs
   - Maintain TypeScript type safety
   - Add tests if possible

4. **Commit & Push**
   - Commit changes and push to your repository
   - Create a **Pull Request** with description

> 💡 **Note**: Creating issues, sharing ideas, pull requests - all forms of participation are welcome. Let's build a tool to make birthdays more fun together!

## License

This project is released under the **[MIT License](LICENSE)**. Feel free to use for commercial or personal purposes, modify, and redistribute (within license terms).

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
</p>

---

<p align="center">
  <strong>For special birthdays and precious moments with loved ones. With love from Japan and around the world. 🎂🎉</strong>
</p>
