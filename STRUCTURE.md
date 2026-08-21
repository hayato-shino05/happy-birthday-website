# 📁 プロジェクト構成（Omoide）

> 想い出箱（Omoide Bako）のディレクトリ構成とアーキテクチャをまとめたドキュメントです。
>
> Next.js 16 の App Router を前提に、UI コンポーネント / ビジネスロジック / 状態管理 / 設定ファイルを明確に分離しています。

---

## 概要

- フロントエンドフレームワーク: **Next.js 16 (App Router)**
- 言語: **TypeScript / React**
- 状態管理: **Zustand**, 一部 React hooks
- バックエンド: **Supabase (PostgreSQL + Storage + Realtime)**

プロジェクトは「ページ」「機能」「UI」「コアライブラリ」をレイヤーごとに分け、保守しやすく拡張しやすい構成を目指しています。

---

## ディレクトリツリー（トップレベル）

```text
omoide/
├── app/                     # Next.js App Router エントリ & API ルート
├── components/              # 再利用可能な React コンポーネント
├── data/                    # i18n および祭りデータパック
├── lib/                     # コアロジック（hooks, stores, i18n など）
├── config/                  # テーマ・音楽などの設定
├── types/                   # TypeScript 型定義
├── public/                  # 画像・フォントなどの静的アセット
├── __tests__/               # テストコード
└── 各種設定ファイル         # lint / format / build 設定
```

---

## `/app` – Next.js App Router

```text
app/
├── layout.tsx              # ルートレイアウト + 共通プロバイダ
├── page.tsx                # トップページ
├── globals.css             # グローバルスタイル + テーマ CSS
├── sitemap.ts              # SEO 用サイトマップ
├── favicon.ico             # ファビコン
│
└── api/                    # REST 形式の API ルート
    ├── birthdays/
    │   ├── route.ts        # GET (一覧), POST (作成)
    │   ├── [id]/route.ts   # GET, PUT, DELETE by ID
    │   ├── check/route.ts  # 今日が誕生日かチェック
    │   └── next/route.ts   # 次の誕生日を取得
    │
    ├── messages/
    │   ├── route.ts        # GET, POST メッセージ
    │   ├── [id]/route.ts   # GET, PUT, DELETE by ID
    │   └── latest/route.ts # 最新メッセージを取得
    │
    ├── media/
    │   ├── route.ts        # メディア一覧取得
    │   ├── [id]/route.ts   # 単一メディア取得 / 削除
    │   └── tags/route.ts   # メディアタグの取得
    │
    ├── gifts/
    │   ├── route.ts        # GET, POST バーチャルギフト
    │   └── [id]/route.ts   # 単一ギフト取得 / 削除
    │
    ├── audio/route.ts      # 音声メッセージ API
    ├── video/route.ts      # 動画メッセージ API
    └── upload/route.ts     # ファイルアップロード処理
```

---

## `/components` – React コンポーネント

### UI コンポーネント（`/components/ui/`）

デザインシステムに基づいた再利用可能な UI コンポーネント群です。

| Component | 説明 |
|-----------|------|
| `Button.tsx` | プライマリ / セカンダリ / ビンテージなどのボタンバリエーション |
| `ButtonVintage.tsx` | ビンテージ風スタイルのボタン |
| `Input.tsx` | バリデーション付きテキスト入力 |
| `Textarea.tsx` | 複数行テキスト入力 |
| `Select.tsx` | セレクトボックス |
| `Card.tsx` | 汎用カードコンテナ |
| `Modal.tsx` | モーダルダイアログ（sm, md, lg, xl, widescreen） |
| `ModalManager.tsx` | 全体のモーダル状態管理 |
| `Toast.tsx` | トースト通知コンポーネント |
| `Loading.tsx` | ローディングスピナー |
| `ErrorBoundary.tsx` | エラーバウンダリラッパー |

**音楽関連コンポーネント**

| Component | 説明 |
|-----------|------|
| `MusicPlayer.tsx` | メインの音楽プレーヤー |
| `MusicControls.tsx` | 再生 / 一時停止 / スキップ操作 |
| `MusicLibrary.tsx` | 楽曲ライブラリブラウザ |
| `MusicUploader.tsx` | カスタム音源のアップロード UI |
| `TrackSelector.tsx` | トラック選択 UI |

**ナビゲーションコンポーネント**

| Component | 説明 |
|-----------|------|
| `LanguageSelector.tsx` | UI 言語の切り替え（英語 / 日本語） |
| `ThemeIndicator.tsx` | 現在のテーマ表示 |
| `HeaderButtons.tsx` | ヘッダーアクションボタン群 |
| `MobileBottomDock.tsx` | モバイル向けボトムナビゲーション & 和風の抽斗（Drawer）メニュー |
| `MobileGameMenu.tsx` | モバイル専用ミニゲームセレクター |
| `SocialButtons.tsx` | SNS 共有ボタン |
| `ShareButton.tsx` | 単体の共有ボタン |
| `FeatureButton.tsx` | 特定機能の ON/OFF トグル |

---

### 3D コンポーネント（`/components/3d/`）

Three.js WebGL を活用したリッチな 3D インタラクティブ体験を提供するコンポーネントです。

| Component | 説明 |
|-----------|------|
| `OmikujiCylinder3D.tsx` | 360 度回転・ドラッグ＆クリック物理シェイク対応の 3D おみくじ筒。RoomEnvironment 反射、PBR 真鍮金箔、手彫り木目テクスチャ、接地シャドウ、竹製みくじ棒のせり出し演出を実装 |

---

### 誕生日機能コンポーネント（`/components/features/`）

誕生日祝い体験に特化したコンポーネントです。

| Component | 説明 |
|-----------|------|
| `BirthdayCake.tsx` | 3D ケーキ + アニメーション |
| `Cake2D.tsx` | 2D ケーキ（フォールバック） |
| `Candle.tsx` | ロウソク単体コンポーネント |
| `BlowButton.tsx` | マイク入力を使った「ロウソクを吹き消す」体験 |
| `CountdownTimer.tsx` | 誕生日までのカウントダウンロジック |
| `CountdownDisplay.tsx` | カウントダウン表示 |
| `BirthdayChecker.tsx` | 今日が誕生日かどうかのチェック |
| `BirthdayHero.tsx` | ヒーローセクション |
| `BirthdayMessage.tsx` | お祝いメッセージ表示 |
| `DailyOmikuji.tsx` | 3D おみくじと連動した運勢表示（和歌・4大運勢・ラッキーアイテム・localStorage 永続化） |
| `OnThisDayFlashback.tsx` | 過去の同じ月日の思い出を振り返るフラッシュバック機能 |
| `PhotoFrame.tsx` | 和風・季節フレーム付きフォト撮影機能 |

**メディア関連コンポーネント**

| Component | 説明 |
|-----------|------|
| `PhotoGallery.tsx` | グリッド表示のフォトギャラリー |
| `PhotoCard.tsx` | 単一写真カード |
| `MediaViewer.tsx` | フルスクリーンのメディアビューア |
| `MediaUploader.tsx` | ドラッグ&ドロップ対応アップローダー |
| `Slideshow.tsx` | スライドショー |
| `TagInput.tsx` | メディア用タグ入力 |

**アニメーションコンポーネント**

| Component | 説明 |
|-----------|------|
| `Fireworks.tsx` | 花火アニメーション |
| `Balloons.tsx` | 風船アニメーション |
| `Confetti.tsx` | 紙吹雪アニメーション |

---

### コミュニティコンポーネント（`/components/community/`）

チャットや掲示板など、コミュニケーション機能をまとめたレイヤーです。

| Component | 説明 |
|-----------|------|
| `ChatRoom.tsx` | リアルタイムグループチャット |
| `MessageList.tsx` | メッセージ一覧表示 |
| `MessageForm.tsx` | メッセージ入力フォーム |
| `MessageModal.tsx` | モーダル形式のメッセージ表示 |
| `BulletinBoard.tsx` | ソーシャル掲示板 |
| `BulletinPost.tsx` | 単一投稿表示 |
| `PostForm.tsx` | 投稿作成フォーム |
| `PostDetail.tsx` | 返信を含む投稿詳細 |
| `TimeCapsule.tsx` | 未来の指定日に届くタイムカプセル（手紙・写真・音声封入） |

**メディアメッセージ**

| Component | 説明 |
|-----------|------|
| `VideoMessageList.tsx` | 動画メッセージ一覧 |
| `VideoRecorder.tsx` | 動画録画 UI |
| `AudioMessageList.tsx` | 音声メッセージ一覧 |
| `AudioRecorder.tsx` | 音声録音 UI |
| `CameraCapture.tsx` | カメラキャプチャ |

**ギフト**

| Component | 説明 |
|-----------|------|
| `GiftSelector.tsx` | ギフト選択 UI |
| `GiftAnimation.tsx` | ギフト演出アニメーション |

---

### ゲームコンポーネント（`/components/games/`）

誕生日向けのミニゲーム群です。

| Component | 説明 |
|-----------|------|
| `MemoryGame.tsx` | 神経衰弱ゲーム |
| `MemoryCard.tsx` | 神経衰弱用カード |
| `BirthdayQuiz.tsx` | 誕生日クイズ |
| `PuzzleGame.tsx` | ジグソーパズル |
| `BirthdayCalendar.tsx` | 誕生日カレンダー |

---

### エフェクトコンポーネント（`/components/effects/`）

装飾用のビジュアルエフェクトをまとめたレイヤーです。

| Component | 説明 |
|-----------|------|
| `ParticleSystem.tsx` | 汎用パーティクルシステム |
| `Confetti.tsx` | 紙吹雪エフェクト |
| `FallingPetals.tsx` | 桜の花びらが舞うエフェクト |
| `FallingLeaves.tsx` | 紅葉が舞うエフェクト |
| `FallingSnow.tsx` | 雪のエフェクト |
| `FloatingLanterns.tsx` | 提灯が浮かぶエフェクト |
| `VideoBackground.tsx` | 動画背景コンポーネント |
| `ThemeEffects.tsx` | テーマに応じたエフェクト切り替え |

---

### レイアウトコンポーネント（`/components/layout/`）

ページ全体の骨組みを定義するコンポーネントです。

| Component | 説明 |
|-----------|------|
| `MainLayout.tsx` | アプリ全体のレイアウト |
| `Header.tsx` | ヘッダー |
| `Footer.tsx` | フッター |
| `FloatingNav.tsx` | 浮遊型ナビゲーション |

---

## `/lib` – コアライブラリ

### Hooks（`/lib/hooks/`）

ビジネスロジックや UI ロジックをカプセル化したカスタムフック群です。

**データ取得系 Hooks**

| Hook | 説明 |
|------|------|
| `useBirthdays.ts` | 誕生日の CRUD 操作 |
| `useBirthdayCheck.ts` | 今日が誕生日かどうかのチェック |
| `useNextBirthday.ts` | 次の誕生日情報を取得 |
| `useMessages.ts` | メッセージ一覧の管理 |
| `useRealtimeMessages.ts` | Realtime メッセージ購読 |
| `usePosts.ts` | 掲示板投稿 + 返信の取得 |
| `useGifts.ts` | バーチャルギフトの取得・送信 |
| `useMediaFiles.ts` | メディアファイル管理 |
| `useUserName.ts` | ローカルストレージに保存したユーザー名の管理 |

**メディア系 Hooks**

| Hook | 説明 |
|------|------|
| `useMusicPlayer.ts` | 音楽プレーヤーの制御 |
| `useSlideshow.ts` | スライドショー制御 |
| `useVideoMessages.ts` | 動画メッセージ管理 |
| `useAudioMessages.ts` | 音声メッセージ管理 |
| `useVideoRecorder.ts` | 動画録画ロジック |
| `useAudioRecorder.ts` | 音声録音ロジック |
| `useMicrophone.ts` | マイクアクセス制御 |

**ゲームロジック Hooks**

| Hook | 説明 |
|------|------|
| `useMemoryGame.ts` | 神経衰弱ゲームのロジック |
| `usePuzzleGame.ts` | パズルゲームのロジック |
| `useQuiz.ts` | クイズロジック |

**ユーティリティ Hooks**

| Hook | 説明 |
|------|------|
| `useTheme.ts` | テーマ状態の管理・検出 |
| `useMediaQuery.ts` | レスポンシブブレークポイント判定 |
| `useSwipeGesture.ts` | スワイプジェスチャー検出 |
| `useKeyboardShortcuts.ts` | キーボードショートカット |
| `useUserName.ts` | ユーザー名の保持 |

---

### Stores（`/lib/stores/`）

Zustand を使ったグローバル状態管理レイヤーです。必要に応じて `persist` ミドルウェアで永続化します。

| Store | 説明 |
|-------|------|
| `birthdayStore.ts` | 誕生日データの状態（CRUD / 次の誕生日など） |
| `themeStore.ts` | テーマ選択（季節・日本 / 国際イベントから自動判定） |
| `musicStore.ts` | 音楽プレーヤーの状態（プレイリスト / ボリューム / リピート / シャッフル） |
| `gameStore.ts` | ゲームスコアやハイスコア管理 |
| `languageStore.ts` | UI 言語（英語 / 日本語）の管理 |
| `uiStore.ts` | モーダル / トーストなど UI 状態 |
| `index.ts` | 各ストアのエクスポート集約 |

---

### Providers（`/lib/providers/`）

React コンテキストや外部ライブラリのプロバイダをまとめたレイヤーです。

| Provider | 説明 |
|----------|------|
| `ThemeProvider.tsx` | テーマコンテキスト（季節・イベントに応じた自動検出） |
| `QueryProvider.tsx` | TanStack Query クライアントのプロバイダ |
| `LanguageContext.tsx` | 言語コンテキスト（英語 / 日本語） |

---

### その他のサブディレクトリ

| ディレクトリ | 説明 |
|-------------|------|
| `/lib/supabase/` | Supabase クライアントとクエリ関連ユーティリティ |
| `/lib/i18n/` | 翻訳データと言語コンテキスト（英語 / 日本語） |
| `/lib/animations/` | Framer Motion 用アニメーション定義 |
| `/lib/utils/` | 汎用ユーティリティ関数 |
| `/lib/validations/` | Zod を使ったバリデーションスキーマ |

## `/data` – 静的データとマニフェスト

| ディレクトリ / ファイル | 説明 |
|-----------------------|------|
| `omikujiData.ts` | 12 種類の本格和風おみくじデータ（大吉〜半吉、和歌・俳句、4大運勢、ラッキー色・品・数） |
| `i18n/en.json` | 英語 UI 辞書データ |
| `i18n/ja.json` | 日本語 UI 辞書データ |
| `festivals/` | 13 の季節・祝祭日データパック |
| `generated/` | 自動生成されたデータマニフェスト（`locales.ts`, `festivals.ts`） |

---

## `/config` – 設定ファイル

| File | 説明 |
|------|------|
| `themes.ts` | 季節・イベントごとのテーマ設定（色・背景・エフェクトなど） |
| `music.ts` | デフォルトの楽曲リスト定義 |

---

## `/types` – TypeScript 型

主要なドメインモデルを TypeScript 型として定義しています。

```typescript
// 代表的な型（types/index.ts より一部抜粋）
interface Birthday { id: number; name: string; month: number; day: number; year?: number; message?: string }
interface CustomMessage { id: number; sender: string; message: string; media_url?: string }
interface AudioMessage { id: number; sender: string; audio_data: string; duration?: number }
interface VideoMessage { id: number; sender: string; video_url: string; thumbnail_url?: string }
interface MediaFile { id: number; file_name: string; file_path: string; file_type: 'image' | 'video' }
interface VirtualGift { id: number; sender: string; gift_emoji: string; gift_name: string }
interface BulletinPost { id: number; author: string; content: string; likes: number; replies?: BulletinReply[] }
type ThemeName = 'spring' | 'summer' | 'autumn' | 'winter' | ...
type Language = 'en' | 'ja'
```

---

## 設定ファイル群

| File | 説明 |
|------|------|
| `package.json` | 依存関係と npm scripts |
| `next.config.ts` | Next.js の設定 |
| `tsconfig.json` | TypeScript コンパイラ設定 |
| `vitest.config.ts` | Vitest 設定 |
| `vitest.setup.ts` | テストセットアップコード |
| `.prettierrc` | Prettier フォーマット設定 |
| `eslint.config.mjs` | ESLint ルール定義 |
| `postcss.config.mjs` | PostCSS / Tailwind 設定 |

---

## アーキテクチャ指針

### 1. コンポーネント構成

- **Atomic Design** を意識し、UI → Features → Pages の階層で整理
- **機能単位のグルーピング**: 誕生日 / メッセージ / メディア / ゲームなど
- **関心の分離**: 表示ロジックとビジネスロジックを切り離す

### 2. 状態管理

- グローバル状態は 基本的に **Zustand ストア** で管理
- 各画面固有の状態は **React Hooks** でローカルに保持
- サーバーサイドのデータは **TanStack Query** によるキャッシュ & フェッチ制御

### 3. データフロー

```text
User Action → Hook → API Route → Supabase → Response → UI Update
                ↓
            Zustand Store（必要な場合のみ）
```

### 4. スタイリング

- **Tailwind CSS** をベースに、ユーティリティクラスでレイアウト
- テーマ切り替え用に **CSS カスタムプロパティ**（色・影など）を活用
- アニメーションは **Framer Motion** を中心に実装

---

## レスポンシブ設計

```css
/* Mobile First Breakpoints */
@media (max-width: 480px)  { /* Small Mobile */ }
@media (max-width: 768px)  { /* Mobile */ }
@media (max-width: 1024px) { /* Tablet */ }
@media (min-width: 1025px) { /* Desktop */ }
```

---

## パフォーマンス最適化

- **Code Splitting**: App Router による自動コード分割
- **Image Optimization**: Next.js `Image` コンポーネント
- **Lazy Loading**: 重いコンポーネントは動的インポート
- **State Persistence**: 必要なストアのみ永続化
- **Caching**: TanStack Query を活用したサーバーサイドデータのキャッシュ
