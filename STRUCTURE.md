# 📁 Project Structure

> Detailed architecture documentation for Happy Birthday Website

## Overview

This project follows **Next.js 16 App Router** architecture with a modular, feature-based structure. It implements clean separation of concerns with dedicated directories for UI components, business logic, state management, and configuration.

---

## Directory Structure

```
happy-birthday-website/
├── 📁 app/                     # Next.js App Router
├── 📁 components/              # React Components
├── 📁 lib/                     # Core Libraries
├── 📁 config/                  # Configuration
├── 📁 types/                   # TypeScript Types
├── 📁 public/                  # Static Assets
├── 📁 __tests__/               # Test Files
└── 📄 Configuration Files
```

---

## `/app` - Next.js App Router

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Home page
├── globals.css             # Global styles + theme CSS
├── sitemap.ts              # SEO sitemap
├── favicon.ico             # Favicon
│
└── api/                    # API Routes (REST)
    ├── birthdays/
    │   ├── route.ts        # GET (list), POST (create)
    │   ├── [id]/route.ts   # GET, PUT, DELETE by ID
    │   ├── check/route.ts  # Check today's birthday
    │   └── next/route.ts   # Get next birthday
    │
    ├── messages/
    │   ├── route.ts        # GET, POST messages
    │   ├── [id]/route.ts   # GET, PUT, DELETE by ID
    │   └── latest/route.ts # Get latest messages
    │
    ├── media/
    │   ├── route.ts        # GET media files
    │   ├── [id]/route.ts   # GET, DELETE by ID
    │   └── tags/route.ts   # Manage media tags
    │
    ├── gifts/
    │   ├── route.ts        # GET, POST virtual gifts
    │   └── [id]/route.ts   # GET, DELETE by ID
    │
    ├── audio/route.ts      # Audio messages API
    ├── video/route.ts      # Video messages API
    └── upload/route.ts     # File upload handler
```

---

## `/components` - React Components

### UI Components (`/components/ui/`)

Reusable, atomic UI components following design system.

| Component | Description |
|-----------|-------------|
| `Button.tsx` | Button variants (primary, secondary, vintage) |
| `ButtonVintage.tsx` | Vintage-styled button |
| `Input.tsx` | Form input with validation |
| `Textarea.tsx` | Multi-line text input |
| `Select.tsx` | Dropdown select |
| `Card.tsx` | Card container |
| `Modal.tsx` | Modal dialog (sm, md, lg, xl, widescreen) |
| `ModalManager.tsx` | Global modal state management |
| `Toast.tsx` | Notification toasts |
| `Loading.tsx` | Loading spinners |
| `ErrorBoundary.tsx` | Error boundary wrapper |

**Music Components:**
| Component | Description |
|-----------|-------------|
| `MusicPlayer.tsx` | Main music player |
| `MusicControls.tsx` | Play/pause/skip controls |
| `MusicLibrary.tsx` | Music collection browser |
| `MusicUploader.tsx` | Upload custom music |
| `TrackSelector.tsx` | Track selection UI |

**Navigation Components:**
| Component | Description |
|-----------|-------------|
| `LanguageSelector.tsx` | Language switcher (VI/EN/JA) |
| `ThemeIndicator.tsx` | Current theme display |
| `HeaderButtons.tsx` | Header action buttons |
| `GameButtons.tsx` | Game navigation |
| `SocialButtons.tsx` | Social sharing |
| `ShareButton.tsx` | Individual share button |
| `FeatureButton.tsx` | Feature toggle button |

---

### Feature Components (`/components/features/`)

Birthday celebration specific components.

| Component | Description |
|-----------|-------------|
| `BirthdayCake.tsx` | 3D animated cake |
| `Cake2D.tsx` | 2D cake alternative |
| `Candle.tsx` | Individual candle |
| `BlowButton.tsx` | Candle blowing interaction |
| `CountdownTimer.tsx` | Birthday countdown logic |
| `CountdownDisplay.tsx` | Countdown visualization |
| `BirthdayChecker.tsx` | Check if today is birthday |
| `BirthdayHero.tsx` | Hero section |
| `BirthdayMessage.tsx` | Birthday message display |

**Media Components:**
| Component | Description |
|-----------|-------------|
| `PhotoGallery.tsx` | Photo gallery with grid |
| `PhotoCard.tsx` | Individual photo card |
| `MediaViewer.tsx` | Full-screen media viewer |
| `MediaUploader.tsx` | Drag-and-drop uploader |
| `Slideshow.tsx` | Auto-playing slideshow |
| `TagInput.tsx` | Media tagging |

**Animation Components:**
| Component | Description |
|-----------|-------------|
| `Fireworks.tsx` | Firework animations |
| `Balloons.tsx` | Floating balloons |
| `Confetti.tsx` | Confetti celebration |

---

### Community Components (`/components/community/`)

Social and communication features.

| Component | Description |
|-----------|-------------|
| `ChatRoom.tsx` | Real-time group chat |
| `MessageList.tsx` | Message display list |
| `MessageForm.tsx` | Message composition |
| `MessageModal.tsx` | Message modal |
| `BulletinBoard.tsx` | Social posts board |
| `BulletinPost.tsx` | Individual post |
| `PostForm.tsx` | Post creation |
| `PostDetail.tsx` | Post with replies |

**Media Messages:**
| Component | Description |
|-----------|-------------|
| `VideoMessageList.tsx` | Video messages |
| `VideoRecorder.tsx` | Video recording |
| `AudioMessageList.tsx` | Audio messages |
| `AudioRecorder.tsx` | Audio recording |
| `CameraCapture.tsx` | Camera integration |

**Gifts:**
| Component | Description |
|-----------|-------------|
| `GiftSelector.tsx` | Gift selection |
| `GiftAnimation.tsx` | Gift presentation |

---

### Game Components (`/components/games/`)

Interactive birthday games.

| Component | Description |
|-----------|-------------|
| `MemoryGame.tsx` | Card matching game |
| `MemoryCard.tsx` | Individual memory card |
| `BirthdayQuiz.tsx` | Trivia quiz |
| `PuzzleGame.tsx` | Jigsaw puzzle |
| `BirthdayCalendar.tsx` | Birthday tracker |

---

### Effect Components (`/components/effects/`)

Visual effects and animations.

| Component | Description |
|-----------|-------------|
| `ParticleSystem.tsx` | Generic particle system |
| `Confetti.tsx` | Confetti particles |
| `FallingPetals.tsx` | Cherry blossom petals |
| `FallingLeaves.tsx` | Autumn leaves |
| `FallingSnow.tsx` | Winter snow |
| `FloatingLanterns.tsx` | Festival lanterns |
| `VideoBackground.tsx` | Video background player |
| `ThemeEffects.tsx` | Theme-based effects |

---

### Layout Components (`/components/layout/`)

Page structure components.

| Component | Description |
|-----------|-------------|
| `MainLayout.tsx` | Main page layout |
| `Header.tsx` | Page header |
| `Footer.tsx` | Page footer |
| `FloatingNav.tsx` | Floating navigation |

---

## `/lib` - Core Libraries

### Hooks (`/lib/hooks/`)

Custom React hooks for business logic.

**Data Hooks:**
| Hook | Description |
|------|-------------|
| `useBirthdays.ts` | Birthday CRUD operations |
| `useBirthdayCheck.ts` | Check birthday status |
| `useNextBirthday.ts` | Get next birthday |
| `useMessages.ts` | Message management |
| `useRealtimeMessages.ts` | Real-time messaging |
| `usePosts.ts` | Bulletin posts with replies |
| `useGifts.ts` | Virtual gifts |
| `useMediaFiles.ts` | Media file management |
| `useUserName.ts` | User name persistence (localStorage) |

**Media Hooks:**
| Hook | Description |
|------|-------------|
| `useMusicPlayer.ts` | Music playback control |
| `useSlideshow.ts` | Slideshow control |
| `useVideoMessages.ts` | Video messages |
| `useAudioMessages.ts` | Audio messages |
| `useVideoRecorder.ts` | Video recording |
| `useAudioRecorder.ts` | Audio recording |
| `useMicrophone.ts` | Microphone access |

**Game Hooks:**
| Hook | Description |
|------|-------------|
| `useMemoryGame.ts` | Memory game logic |
| `usePuzzleGame.ts` | Puzzle game logic |
| `useQuiz.ts` | Quiz game logic |

**Utility Hooks:**
| Hook | Description |
|------|-------------|
| `useTheme.ts` | Theme management |
| `useMediaQuery.ts` | Responsive breakpoints |
| `useSwipeGesture.ts` | Touch gestures |
| `useKeyboardShortcuts.ts` | Keyboard navigation |
| `useUserName.ts` | User name persistence |

---

### Stores (`/lib/stores/`)

Zustand state management with persistence.

| Store | Description |
|-------|-------------|
| `birthdayStore.ts` | Birthday data state (CRUD, next birthday check) |
| `themeStore.ts` | Theme preferences (16 themes, auto-detect) |
| `musicStore.ts` | Music player state (playlist, volume, repeat, shuffle) |
| `gameStore.ts` | Game scores and state (high scores, top 10) |
| `languageStore.ts` | Language preference (VI/EN/JA) |
| `uiStore.ts` | UI state (modals, toasts) |
| `index.ts` | Store exports |

---

### Providers (`/lib/providers/`)

React context providers.

| Provider | Description |
|----------|-------------|
| `ThemeProvider.tsx` | Theme context (16 themes, auto-detect) |
| `QueryProvider.tsx` | TanStack Query client |
| `LanguageContext.tsx` | Language context (VI/EN/JA) |

---

### Other Libraries

| Directory | Description |
|-----------|-------------|
| `/lib/supabase/` | Supabase client and queries |
| `/lib/i18n/` | Translations (VI, EN, JA) |
| `/lib/animations/` | Framer Motion variants |
| `/lib/utils/` | Utility functions |
| `/lib/validations/` | Form validation schemas |

---

## `/config` - Configuration

| File | Description |
|------|-------------|
| `themes.ts` | 16 theme configurations |
| `music.ts` | Default music tracks |

---

## `/types` - TypeScript Types

```typescript
// Core types defined in types/index.ts
interface Birthday { id, name, month, day, year?, message? }
interface CustomMessage { id, sender, message, media_url? }
interface AudioMessage { id, sender, audio_data, duration? }
interface VideoMessage { id, sender, video_url, thumbnail_url? }
interface MediaFile { id, file_name, file_path, file_type }
interface VirtualGift { id, sender, gift_emoji, gift_name }
interface BulletinPost { id, author, content, likes, replies? }
type ThemeName = 'spring' | 'summer' | 'autumn' | 'winter' | ...
type Language = 'vi' | 'en' | 'ja'
```

---

## Configuration Files

| File | Description |
|------|-------------|
| `package.json` | Dependencies and scripts |
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript configuration |
| `vitest.config.ts` | Test configuration |
| `vitest.setup.ts` | Test setup |
| `.prettierrc` | Code formatting |
| `eslint.config.mjs` | Linting rules |
| `postcss.config.mjs` | PostCSS/Tailwind |

---

## Architecture Patterns

### 1. Component Architecture
- **Atomic Design**: UI → Features → Pages
- **Feature-based**: Components grouped by functionality
- **Separation of Concerns**: UI, logic, data layers

### 2. State Management
- **Zustand Stores**: Global state with persistence
- **React Hooks**: Local state and side effects
- **TanStack Query**: Server state caching

### 3. Data Flow
```
User Action → Hook → API Route → Supabase → Response → UI Update
                ↓
            Zustand Store (if needed)
```

### 4. Styling
- **Tailwind CSS**: Utility-first
- **CSS Variables**: Theme colors
- **Framer Motion**: Animations

---

## Responsive Design

```css
/* Mobile First Breakpoints */
@media (max-width: 480px)  { /* Small Mobile */ }
@media (max-width: 768px)  { /* Mobile */ }
@media (max-width: 1024px) { /* Tablet */ }
@media (min-width: 1025px) { /* Desktop */ }
```

---

## Performance Optimizations

- **Code Splitting**: Automatic with App Router
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Dynamic imports for heavy components
- **State Persistence**: Zustand persist middleware
- **Caching**: TanStack Query caching
