# happy-birthday-website

<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/lang-%E6%97%A5%E6%9C%AC%E8%AA%9E-red" alt="Japanese"></a>
  <img src="https://img.shields.io/badge/version-0.1.0-4f46e5" alt="Version 0.1.0">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-yellow" alt="License MIT"></a>
  <img src="https://img.shields.io/badge/Next.js-16.0.7-black?logo=nextdotjs" alt="Next.js 16.0.7">
  <img src="https://img.shields.io/badge/React-19.2.1-61DAFB?logo=react&logoColor=111111" alt="React 19.2.1">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=ffffff" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=ffffff" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/Supabase-2.86.2-3FCF8E?logo=supabase&logoColor=ffffff" alt="Supabase 2.86.2">
  <img src="https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel" alt="Deploy on Vercel">
</p>

## INDEX

1. [ABOUT](#about)
2. [FEATURES](#features)
3. [VALUE](#value)
4. [TECH STACK](#tech-stack)
5. [ENVIRONMENT](#environment)
6. [HOW TO USE](#how-to-use)
7. [DEPLOY](#deploy)
8. [SECURITY](#security)
9. [PROJECT STRUCTURE](#project-structure)
10. [NPM SCRIPTS](#npm-scripts)
11. [DOCUMENTS](#documents)
12. [CONTRIBUTING](#contributing)
13. [LICENSE](#license)

## ABOUT

`happy-birthday-website` is an interactive Next.js application for remembering, celebrating, and sharing birthdays with people who matter.

It brings birthday countdowns, a 2D birthday cake, wish messages, photo and video albums, mini games, and seasonal themes into one web experience. The project is designed to work as a small celebration space for families, friends, teams, or communities.

> [!NOTE]
> This README avoids decorative emoji and represents feature groups with `lucide-react` icon names.

## FEATURES

### CORE

| Icon | Feature | Description |
|------|---------|-------------|
| `Timer` | Real-time countdown | Shows the remaining time until the next birthday using Supabase birthday data. |
| `Cake` | Interactive cake | Provides a 2D cake and candle experience for birthday celebrations. |
| `Music` | Music player | Plays birthday songs and custom tracks with Howler.js. |
| `Sparkles` | Visual effects | Displays confetti, fireworks, balloons, and seasonal particles. |

### MEDIA

| Icon | Feature | Description |
|------|---------|-------------|
| `Image` | Photo and video album | Organizes memories with Supabase Storage. |
| `Tags` | Tag management | Adds searchable tags to media files. |
| `Upload` | Media upload | Supports image and video uploads through `react-dropzone`. |
| `Search` | Search | Helps users find media by tags or text. |

### GAMES AND ENTERTAINMENT

| Icon | Feature | Description |
|------|---------|-------------|
| `Trophy` | Memory game | Lets users flip cards and find matching pairs. |
| `Puzzle` | Jigsaw puzzle | Generates a puzzle from an image with adjustable difficulty. |
| `ClipboardList` | Birthday quiz | Displays customizable birthday-themed quiz content. |
| `CalendarDays` | Birthday calendar | Shows birthdays grouped by month in a calendar UI. |

### COMMUNITY

| Icon | Feature | Description |
|------|---------|-------------|
| `MessageCircle` | Real-time chat | Provides chat powered by Supabase Realtime. |
| `PenLine` | Wish message board | Supports posts, likes, and replies for celebration messages. |
| `Mic` | Voice messages | Records audio messages directly in the browser. |
| `Video` | Video messages | Captures video messages through the webcam. |
| `Gift` | Virtual gifts | Lets users send digital gifts. |
| `Users` | Sharing flow | Makes invitation URLs easier to share through social buttons. |

### THEME

| Icon | Feature | Description |
|------|---------|-------------|
| `Palette` | Seasonal themes | Switches visual themes for spring, summer, autumn, and winter. |
| `PartyPopper` | Event themes | Supports Christmas, Halloween, Hanami, Tanabata, New Year, and more. |
| `Video` | Video backgrounds | Uses theme-specific video backgrounds with fallback images. |
| `Languages` | Internationalization | Supports Japanese and English UI switching. |

## VALUE

1. **Make birthdays harder to forget**
   - Check upcoming birthdays with a countdown.
   - Keep family, friend, and team celebration dates in one place.

2. **Preserve memories**
   - Store photos, videos, audio, and text messages together.
   - Build an album experience that is easy to revisit later.

3. **Make online celebrations more lively**
   - Add motion and play through mini games and effects.
   - Match the mood with seasonal and event themes.

4. **Work as a shared community space**
   - Use it for classes, circles, teams, families, or friend groups.
   - Customize it freely because it is open source.

## TECH STACK

### FRONTEND

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.7 | App Router and API Routes |
| React | 19.2.1 | UI components |
| TypeScript | 5.x | Type-safe implementation |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.23.25 | Animation |
| lucide-react | 0.556.0 | UI icons |
| Zustand | 5.0.9 | Global state management |
| TanStack Query | 5.90.12 | Server state and caching |
| Howler.js | 2.2.4 | Audio playback |
| react-dropzone | 14.3.8 | File upload UI |
| date-fns | 4.1.0 | Date utilities |

### BACKEND AND SERVICES

| Technology | Purpose |
|------------|---------|
| Supabase | PostgreSQL-based BaaS |
| Supabase Storage | Media file storage |
| Supabase Realtime | Real-time subscriptions |
| Next.js API Routes | API boundaries |
| Vercel Analytics | Web analytics |
| Vercel | Hosting |

### DEVELOPMENT

| Tool | Purpose |
|------|---------|
| Vitest | Test runner |
| Testing Library | React component testing |
| ESLint | Static analysis |
| Prettier | Formatting |

## ENVIRONMENT

### REQUIREMENTS

| Item | Version or condition |
|------|----------------------|
| Node.js | 20.9.0 or higher |
| npm | Version bundled with Node.js |
| Supabase | Project URL and anonymous key are required |
| Browser | Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+ |

### ENV VARIABLES

Copy `.env.example` to `.env.local`.

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anonymous key |
| `NEXT_PUBLIC_BASE_URL` | no | Public base URL. The sitemap uses a default value when omitted. |

## HOW TO USE

### 1. Clone repository

```bash
git clone https://github.com/hayato-shino05/happy-birthday-website.git
cd happy-birthday-website
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Prepare Supabase

See [DATABASE.md](./DATABASE.md) for required tables, Storage setup, and RLS policies.

### 5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Verify locally

```bash
npm run lint
npm run test
npm run build
```

## DEPLOY

### Vercel

<a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhayato-shino05%2Fhappy-birthday-website&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,NEXT_PUBLIC_BASE_URL&envDescription=Supabase%20configuration%20and%20public%20base%20URL&envLink=https%3A%2F%2Fsupabase.com%2Fdocs">
  <img src="https://vercel.com/button" alt="Deploy with Vercel">
</a>

For manual deployment, import the repository into Vercel and configure the required Environment Variables.

## SECURITY

| Item | Handling |
|------|----------|
| Supabase anonymous key | Public frontend key. Use it with RLS. |
| Supabase service role key | Never expose it in `.env.local`, README files, or the client bundle. |
| RLS | Enable Row Level Security in Supabase. |
| Uploads | Control file size, type, and visibility with both app validation and Supabase settings. |

## PROJECT STRUCTURE

See [STRUCTURE.md](./STRUCTURE.md) for details.

```text
happy-birthday-website/
├── app/                      # Next.js App Router and API Routes
├── components/               # UI, features, community, games, effects
├── config/                   # Theme and music configuration
├── lib/                      # hooks, stores, Supabase, i18n, providers
├── public/                   # Static assets
├── types/                    # TypeScript type definitions
├── __tests__/                # Tests
├── DATABASE.md               # Supabase schema
├── STRUCTURE.md              # Architecture overview
└── package.json              # scripts and dependencies
```

## NPM SCRIPTS

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Start the production server. |
| `npm run lint` | Run ESLint. |
| `npm run test` | Run Vitest once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run test:coverage` | Run tests with coverage. |

## DOCUMENTS

| Document | Content |
|----------|---------|
| [README.md](./README.md) | Japanese README |
| [STRUCTURE.md](./STRUCTURE.md) | Directory structure and architecture |
| [DATABASE.md](./DATABASE.md) | Supabase schema and policies |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guide |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Code of conduct |

## CONTRIBUTING

Contributions are welcome. For large feature or design changes, please open an Issue first to discuss the direction.

Basic flow:

1. Fork and clone the repository.
2. Create a working branch.
3. Implement code or documentation changes.
4. Run `npm run lint`, `npm run test`, and `npm run build` when relevant.
5. Open a Pull Request.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## LICENSE

This project is released under the [MIT License](./LICENSE).

<p align="center">
  <strong>For special birthdays and meaningful time with people who matter.</strong>
</p>
