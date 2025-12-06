# 誕生日お祝いウェブサイト - 喜びのつながり

> **創造性豊かなオープンソースのインタラクティブウェブサイト**で、友人たちの誕生日を楽しくユニークに組織、記憶、共有しましょう！リアルタイムカウントダウンから2Dケーキのろうそく吹き消し、写真・動画アルバム、ミニゲーム、リアルタイムチャット、季節ごとのテーマまで、忘れられない誕生日体験を提供します！

[![English](https://img.shields.io/badge/lang-English-blue)](README.en.md)

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

## 🌟 主な機能

### 🎂 コア機能
| **機能**                     | **説明**                                                                 |
|------------------------------|--------------------------------------------------------------------------|
| 🎉 **リアルタイムカウントダウン** | Supabaseから誕生日データを取得し、次の誕生日までの残り時間をリアルタイム表示 |
| 🎂 **インタラクティブケーキ** | 美しい2Dケーキ、マイク対応ろうそく吹き消し機能（Framer Motion使用）       |
| 🎵 **音楽プレーヤー**         | Howler.js使用、誕生日ソング自動再生、カスタム音楽アップロード機能         |
| 🎈 **視覚効果**              | 紙吹雪、花火、風船アニメーション（Framer Motion使用）                     |

### 📸 アルバム・メディア機能
| **機能**                     | **説明**                                                                 |
|------------------------------|--------------------------------------------------------------------------|
| 📸 **写真・動画アルバム**     | Supabase Storageでメディア管理、タグ付け、検索、スライドショー機能       |
| 🏷️ **タグシステム**          | メディアファイルにタグ付け、タグによる検索・フィルタリング               |
| ⬆️ **メディアアップロード**   | 写真・動画の直接アップロード（50MB上限、react-dropzone使用）             |
| 🔍 **検索機能**              | タグベースの高速検索、リアルタイムフィルタリング                         |

### 🎮 ゲーム・エンターテイメント
| **機能**                     | **説明**                                                                 |
|------------------------------|--------------------------------------------------------------------------|
| 🧠 **神経衰弱ゲーム**         | メモリーカードゲーム、Zustandでスコア記録・永続化                        |
| 🧩 **パズルゲーム**          | 写真を使ったジグソーパズル、難易度調整可能                               |
| ❓ **誕生日クイズ**          | カスタマイズ可能な誕生日関連クイズ                                       |
| 📅 **誕生日カレンダー**      | 月別誕生日表示、視覚的カレンダーインターフェース                         |

### 💬 コミュニティ・ソーシャル機能
| **機能**                     | **説明**                                                                 |
|------------------------------|--------------------------------------------------------------------------|
| 💬 **リアルタイムチャット**   | Supabaseリアルタイム機能使用、ユーザー名永続化（localStorage）           |
| 📋 **お祝い掲示板**          | 公開メッセージ投稿、いいね、返信機能                                     |
| 🎙️ **音声メッセージ**        | ブラウザ録音機能、音声メッセージ保存・再生                               |
| 📹 **ビデオメッセージ**      | ウェブカメラ録画、ビデオメッセージ保存・再生                             |
| 🎁 **バーチャルギフト**      | デジタルギフト選択・送信システム（8種類のギフト）                        |
| ✉️ **友達招待**              | ソーシャルメディア共有機能                                               |

### 🎭 テーマ・カスタマイゼーション
| **機能**                     | **説明**                                                                 |
|------------------------------|--------------------------------------------------------------------------|
| 🌸 **季節テーマ**            | 春（桜）、夏、秋（紅葉）、冬（雪）の自動切り替え                         |
| 🎄 **祭りテーマ**            | クリスマス、ハロウィン、お正月、お盆、七夕、花見、テト、中秋節など16テーマ |
| 🎬 **動画背景**              | テーマに応じた動画背景、フォールバック機能                               |
| ✨ **パーティクル効果**      | 落ち葉、花びら、雪、提灯、花火などのアニメーション                       |
| 🌐 **多言語サポート**        | 日本語・英語・ベトナム語の完全対応、動的言語切り替え                     |

## プロジェクトの素晴らしい利点 💖

1. **友情の絆を強める**:
   - 友人の誕生日を決して忘れません。
   - 共有スペースで交流と共有を促進します。
   - 意味ある誕生日イベントで人々を結びつけます。

2. **永遠の思い出を保存**:
   - デジタルアルバムで美しい瞬間を写真とビデオで保存します。
   - 友人や家族と簡単に振り返り共有します。
   - グループの共有コレクションを構築します。

3. **楽しくインタラクティブなエンターテイメント**:
   - ゲームと効果でお祝いの雰囲気を高めます。
   - ビデオメッセージ機能で特別な瞬間を記録します。
   - 視覚効果でユーザーの興味を引きます。

4. **実用的な利便性**:
   - 自動カウントダウンで重要な日を思い出します。
   - ワンクリックでソーシャルメディアに喜びを共有します。
   - すべての年齢層に使いやすいインターフェース。

5. **強固なコミュニティ構築**:
   - 参加と貢献のための共有スペースを作成します。
   - メンバー間の積極的な交流を奨励します。
   - メッセージとギフト機能でつながりを強化します。

## 使用技術

### フロントエンド
| 技術 | バージョン | 説明 |
|------|-----------|------|
| **Next.js** | 16.0.7 | App Router、React Compiler対応 |
| **React** | 19.2.0 | 最新のReact機能 |
| **TypeScript** | 5.0 | 型安全な開発 |
| **Tailwind CSS** | 4.0 | ユーティリティファーストCSS |
| **Framer Motion** | 12.23.25 | アニメーション |
| **Zustand** | 5.0.9 | 状態管理（永続化対応） |
| **TanStack Query** | 5.90.12 | サーバー状態管理 |
| **Howler.js** | 2.2.4 | 音楽再生 |
| **react-dropzone** | 14.3.8 | ファイルアップロード |
| **date-fns** | 4.1.0 | 日付処理 |

### バックエンド
| 技術 | 説明 |
|------|------|
| **Supabase** | PostgreSQLデータベース |
| **Supabase Storage** | メディアファイル保存 |
| **Supabase Realtime** | リアルタイム機能 |
| **Next.js API Routes** | RESTful API |

### 開発ツール
| 技術 | 説明 |
|------|------|
| **Vitest** | テストフレームワーク |
| **Testing Library** | コンポーネントテスト |
| **ESLint** | コード品質 |
| **Prettier** | コードフォーマット |

## 開始ガイド

### 前提条件
- Node.js 18以上
- npm または yarn
- Supabaseアカウント

### 1. ソースコードをダウンロード
```bash
git clone https://github.com/yourusername/happy-birthday-website.git
cd happy-birthday-website
```

### 2. 依存関係をインストール
```bash
npm install
# または
yarn install
```

### 3. 環境変数を設定
```bash
cp .env.example .env.local
```

`.env.local`ファイルを編集:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. データベースのセットアップ
[DATABASE.md](./DATABASE.md)を参照して、必要なテーブルを作成:
- `birthdays` - 誕生日情報
- `custom_messages` - メッセージ
- `media_files` - メディアファイル
- `virtual_gifts` - バーチャルギフト
- `audio_messages` - 音声メッセージ
- `video_messages` - ビデオメッセージ
- `bulletin_posts` - 掲示板投稿
- `bulletin_replies` - 掲示板返信

### 5. 開発サーバーを起動
```bash
npm run dev
# または
yarn dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く。

### 6. デプロイメント

#### Vercelデプロイメント (推奨)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fhappy-birthday-website&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20configuration%20required&envLink=https%3A%2F%2Fsupabase.io%2F)

**手動デプロイ:**
1. [Vercel](https://vercel.com/)にプロジェクトをインポート
2. Environment Variablesを設定:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabaseプロジェクト URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
3. 自動ビルド・デプロイ完了！

## 環境変数とセキュリティ

### 必要な環境変数
| 変数名 | 説明 | 例 |
|--------|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabaseプロジェクト URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiI...` |

### セキュリティノート
- ✅ **安全**: Anonymous keysは公開用です
- ✅ **安全**: URLは公開情報です  
- ❌ **危険**: Service role keyやパスワードは絶対に公開しない
- ✅ **RLS**: SupabaseでRow Level Securityを有効にする

## プロジェクト構造 💻

```
happy-birthday-website/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── birthdays/        # 誕生日API
│   │   ├── messages/         # メッセージAPI
│   │   ├── media/            # メディアAPI
│   │   ├── gifts/            # ギフトAPI
│   │   ├── audio/            # 音声API
│   │   ├── video/            # ビデオAPI
│   │   └── upload/           # アップロードAPI
│   ├── layout.tsx            # ルートレイアウト
│   ├── page.tsx              # ホームページ
│   └── globals.css           # グローバルCSS
├── components/
│   ├── ui/                   # UIコンポーネント
│   │   ├── Button.tsx        # ボタン
│   │   ├── Modal.tsx         # モーダル
│   │   ├── MusicPlayer.tsx   # 音楽プレーヤー
│   │   └── ...
│   ├── features/             # 機能コンポーネント
│   │   ├── BirthdayCake.tsx  # ケーキ
│   │   ├── CountdownTimer.tsx # カウントダウン
│   │   ├── PhotoGallery.tsx  # フォトギャラリー
│   │   └── ...
│   ├── community/            # コミュニティ機能
│   │   ├── ChatRoom.tsx      # チャット
│   │   ├── BulletinBoard.tsx # 掲示板
│   │   ├── GiftSelector.tsx  # ギフト選択
│   │   └── ...
│   ├── games/                # ゲーム
│   │   ├── MemoryGame.tsx    # 神経衰弱
│   │   ├── PuzzleGame.tsx    # パズル
│   │   ├── BirthdayQuiz.tsx  # クイズ
│   │   └── BirthdayCalendar.tsx # カレンダー
│   ├── effects/              # 視覚効果
│   │   ├── FallingPetals.tsx # 花びら
│   │   ├── FallingSnow.tsx   # 雪
│   │   ├── FallingLeaves.tsx # 落ち葉
│   │   ├── FloatingLanterns.tsx # 提灯
│   │   └── VideoBackground.tsx # 動画背景
│   └── layout/               # レイアウト
│       └── MainLayout.tsx    # メインレイアウト
├── lib/
│   ├── hooks/                # カスタムフック
│   │   ├── useBirthdayCheck.ts
│   │   ├── useMessages.ts
│   │   ├── useMusicPlayer.ts
│   │   └── ...
│   ├── stores/               # Zustandストア
│   │   ├── birthdayStore.ts
│   │   ├── themeStore.ts
│   │   ├── musicStore.ts
│   │   └── gameStore.ts
│   ├── supabase/             # Supabaseクライアント
│   ├── providers/            # Reactプロバイダー
│   └── i18n/                 # 多言語対応
├── config/
│   ├── themes.ts             # 16テーマ設定
│   └── music.ts              # 音楽設定
├── types/                    # TypeScript型定義
├── __tests__/                # テストファイル
├── public/                   # 静的ファイル
│   ├── video/                # テーマ用背景ビデオ
│   └── audio/                # 音楽ファイル
└── package.json              # 依存関係
```

詳細は [STRUCTURE.md](./STRUCTURE.md) を参照。

## NPMスクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run start` | プロダクションサーバー起動 |
| `npm run lint` | ESLintチェック |
| `npm run test` | テスト実行 |
| `npm run test:watch` | テストウォッチモード |
| `npm run test:coverage` | カバレッジレポート |

## サポートブラウザ 

- **Google Chrome** (推奨)
- **Mozilla Firefox**
- **Apple Safari**
- **Microsoft Edge**

## ドキュメント

| ドキュメント | 説明 |
|-------------|------|
| [STRUCTURE.md](./STRUCTURE.md) | プロジェクト構造詳細 |
| [DATABASE.md](./DATABASE.md) | データベーススキーマ |

## 貢献 

プロジェクトをより良くするための貢献を歓迎します！以下のステップに従ってください:

1. **リポジトリをForkとClone**:
   - プロジェクトをForkし、ローカルにClone。

2. **新しいブランチを作成**:
   ```bash
   git checkout -b feature/機能名
   ```

3. **変更を実施**:
   - コードを書く、バグ修正、または新機能追加。
   - TypeScriptの型安全性を維持。
   - テストを追加。

4. **CommitとPush**:
   - 変更をCommitし、自分のリポジトリにPush。
   - 詳細な説明付きで**Pull Request**を開く。

> 💡 **注意**: アイデア、バグ報告 (issue)、プルリクエストを歓迎します！一緒に創造的で結束したコミュニティを築きましょう！

## ライセンス 

このプロジェクトは** [MIT](LICENSE) ライセンス**の下で配布 - 自由に使用、編集、共有可能です。

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
</p>

---

<p align="center">
  <strong>特別な誕生日と大切な友人たちへ❤️で作成！</strong>
</p>
