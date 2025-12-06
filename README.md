# 誕生日お祝いサイト - 喜びでつながるプラットフォーム

> **創造的なインタラクティブ・オープンソース Web サイト** です。友だちや家族の誕生日を「覚える・祝う・共有する」ための仕掛けを、楽しくユニークな形でまとめています。リアルタイムのカウントダウン、2D バースデーケーキへの「ふーっ」と息を吹きかける演出、写真・動画アルバム、ミニゲーム、リアルタイムチャット、季節やお祭りに合わせたテーマなど、忘れられない誕生日体験を届けます。

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

| **機能**                        | **説明**                                                                 |
|---------------------------------|--------------------------------------------------------------------------|
| 🎉 **リアルタイム・カウントダウン** | Supabase から誕生日データを取得し、次の誕生日までの残り時間をリアルタイムで表示 |
| 🎂 **インタラクティブなバースデーケーキ** | かわいい 2D ケーキ。マイクに向かって息を吹きかけるとロウソクが消える演出（Framer Motion 利用） |
| 🎵 **ミュージックプレイヤー**       | Howler.js を使ったバースデーソング再生。カスタム楽曲のアップロードにも対応 |
| 🎈 **ビジュアル・エフェクト**        | 紙吹雪、花火、風船などのエフェクト（Framer Motion 利用） |

### 📸 アルバム & メディア機能

| **機能**                        | **説明**                                                                 |
|---------------------------------|--------------------------------------------------------------------------|
| 📸 **写真・動画アルバム**        | Supabase Storage を使ったメディア管理。タグ付け、検索、スライドショー表示 |
| 🏷️ **タグシステム**              | メディアファイルへのタグ付け、タグによる検索・フィルタリング |
| ⬆️ **メディアアップロード**       | 画像/動画の直接アップロード（50MB 制限、react-dropzone 利用） |
| 🔍 **検索機能**                  | タグやテキストによる高速検索。リアルタイムに結果を反映 |

### 🎮 ゲーム & エンタメ

| **機能**                        | **説明**                                                                 |
|---------------------------------|--------------------------------------------------------------------------|
| 🧠 **神経衰弱ゲーム**            | カードをめくってペアを当てるメモリーゲーム。スコアは Zustand で管理 |
| 🧩 **ジグソーパズル**           | 任意の画像からパズルを生成し、難易度を調整可能 |
| ❓ **バースデークイズ**          | 誕生日にちなんだクイズ。問題文は自由にカスタマイズ可能 |
| 📅 **バースデーカレンダー**      | 誕生日を月別に表示するカレンダー UI |

### 💬 コミュニティ & ソーシャル機能

| **機能**                        | **説明**                                                                 |
|---------------------------------|--------------------------------------------------------------------------|
| 💬 **リアルタイムチャット**       | Supabase Realtime を利用したチャット。ユーザー名は localStorage に保存 |
| 📋 **お祝いメッセージボード**     | 公開メッセージの投稿・「いいね」・返信が可能な掲示板 |
| 🎙️ **ボイスメッセージ**         | ブラウザ上で録音し、音声メッセージとして保存・再生 |
| 📹 **ビデオメッセージ**          | Web カメラで動画を撮影し、ビデオメッセージとして保存・再生 |
| 🎁 **バーチャルギフト**          | 複数種類のデジタルギフトを選んで送信できる仕組み |
| ✉️ **友だち招待**               | ソーシャル共有ボタンから簡単に URL をシェア |

### 🎭 テーマ & カスタマイズ

※ コード側では日本・国際的なテーマに統一しています。

| **機能**                        | **説明**                                                                 |
|---------------------------------|--------------------------------------------------------------------------|
| 🌸 **季節テーマ**                | 春（桜）、夏、秋（紅葉）、冬（雪）など、季節に合わせたテーマを自動切り替え |
| 🎄 **お祭り・イベントテーマ**     | クリスマス、ハロウィン、花見、お盆、月見、七夕、正月、こどもの日、文化の日 など |
| 🎬 **動画背景**                  | テーマごとの動画背景を再生。再生できない場合はフォールバック画像を使用 |
| ✨ **パーティクル・エフェクト**   | 花びら、紅葉、雪、提灯、花火など、テーマに応じたエフェクト |
| 🌐 **多言語対応**                | 英語・日本語をサポート。UI から動的に切り替え可能 |

## このプロジェクトで得られる価値 💖

1. **友人・家族とのつながりを強くする**
   - 大切な人の誕生日をうっかり忘れることを防ぐ
   - 共通の「お祝いスペース」でメッセージや思い出を共有
   - 誕生日をきっかけにコミュニケーションが自然に増える

2. **思い出を長く残せる**
   - 写真・動画をデジタルアルバムとして整理して保存
   - いつでも簡単に見返したり、家族や友人と共有できる
   - グループで「共通の思い出コレクション」を育てられる

3. **場を盛り上げるエンタメ要素**
   - ゲームやエフェクトでオンラインのお祝いを楽しく演出
   - ビデオメッセージで、その瞬間の気持ちをしっかり残せる
   - 見た目も動きもある UI で「特別感」を出せる

4. **実用性の高い機能**
   - 自動カウントダウンで重要な日を事前に把握
   - ワンクリックで SNS へシェアできる導線
   - シンプルな UI で、IT に詳しくない人でも扱いやすい

5. **小さなコミュニティのハブとして使える**
   - チーム・サークル・クラスなどの「共通の場」として運用可能
   - メッセージやギフト機能で、前向きなコミュニケーションを促進
   - オープンソースなので、コミュニティに合わせて自由に拡張できる

## 使用技術スタック

### フロントエンド

| 技術 | バージョン | 説明 |
|------|-----------|------|
| **Next.js** | 16.0.7 | App Router 採用、React Compiler 対応 |
| **React** | 19.2.0 | 最新の React 機能を利用 |
| **TypeScript** | 5.0 | 型安全な開発 |
| **Tailwind CSS** | 4.0 | Utility-first なスタイリング |
| **Framer Motion** | 12.23.25 | アニメーション実装 |
| **Zustand** | 5.0.9 | グローバル state 管理（永続化対応） |
| **TanStack Query** | 5.90.12 | サーバーサイド state とキャッシュ管理 |
| **Howler.js** | 2.2.4 | オーディオ再生 |
| **react-dropzone** | 14.3.8 | ファイルアップロード UI |
| **date-fns** | 4.1.0 | 日付・時刻処理 |

### バックエンド

| 技術 | 説明 |
|------|------|
| **Supabase** | PostgreSQL ベースの BaaS |
| **Supabase Storage** | メディアファイル保存用ストレージ |
| **Supabase Realtime** | リアルタイム購読機能 |
| **Next.js API Routes** | RESTful API 実装 |

### 開発ツール

| ツール | 説明 |
|------|------|
| **Vitest** | テストフレームワーク |
| **Testing Library** | React コンポーネントテスト |
| **ESLint** | コード品質チェック |
| **Prettier** | コードフォーマッタ |

## はじめ方（ローカル環境）

### 前提条件

- Node.js 18 以上
- npm または yarn
- Supabase アカウント

### 1. ソースコード取得

```bash
git clone https://github.com/yourusername/happy-birthday-website.git
cd happy-birthday-website
```

### 2. 依存パッケージのインストール

```bash
npm install
# または
yarn install
```

### 3. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` を編集します:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. データベースのセットアップ

必要なテーブルやポリシーの詳細は [DATABASE.md](./DATABASE.md) を参照してください。主なテーブル:

- `birthdays` - 誕生日情報
- `custom_messages` - メッセージ
- `media_files` - メディアファイル
- `virtual_gifts` - バーチャルギフト
- `audio_messages` - ボイスメッセージ
- `video_messages` - ビデオメッセージ
- `bulletin_posts` - 掲示板投稿
- `bulletin_replies` - 掲示板返信

### 5. 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### 6. デプロイ

#### Vercel へのデプロイ（推奨）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fhappy-birthday-website&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20configuration%20required&envLink=https%3A%2F%2Fsupabase.io%2F)

**手動デプロイの流れ:**

1. プロジェクトを [Vercel](https://vercel.com/) にインポート
2. Environment Variables を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクト URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
3. そのまま Vercel 側でビルド & デプロイが実行されます

## 環境変数とセキュリティ

### 必要な環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiI...` |

### セキュリティ上の注意

- ✅ **安全**: Anonymous key はフロントエンドから利用する前提の公開キー
- ✅ **安全**: URL 自体は公開情報
- ❌ **危険**: Service role key やパスワード類は絶対に公開しない
- ✅ **RLS**: Supabase 側で Row Level Security を有効化しておく

## プロジェクト構成 💻

詳細な構成図は [STRUCTURE.md](./STRUCTURE.md) を参照してください。ここでは概要だけ記載します。

```text
happy-birthday-website/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── birthdays/        # 誕生日 API
│   │   ├── messages/         # メッセージ API
│   │   ├── media/            # メディア API
│   │   ├── gifts/            # ギフト API
│   │   ├── audio/            # 音声メッセージ API
│   │   ├── video/            # ビデオメッセージ API
│   │   └── upload/           # アップロード API
│   ├── layout.tsx            # ルートレイアウト
│   ├── page.tsx              # トップページ
│   └── globals.css           # グローバル CSS
├── components/
│   ├── ui/                   # UI コンポーネント
│   ├── features/             # 誕生日向け機能コンポーネント
│   ├── community/            # コミュニティ機能
│   ├── games/                # ゲーム
│   ├── effects/              # ビジュアルエフェクト
│   └── layout/               # レイアウト
├── lib/
│   ├── hooks/                # カスタム Hooks
│   ├── stores/               # Zustand ストア
│   ├── supabase/             # Supabase クライアント
│   ├── providers/            # React プロバイダー
│   └── i18n/                 # 多言語対応
├── config/                   # テーマ・音楽などの設定
├── types/                    # TypeScript 型定義
├── __tests__/                # テストコード
├── public/                   # 静的ファイル（動画・音声など）
└── package.json              # 依存関係とスクリプト
```

## npm スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint 実行 |
| `npm run test` | テスト実行 |
| `npm run test:watch` | ウォッチモードでテスト実行 |
| `npm run test:coverage` | カバレッジレポート生成 |

## 対応ブラウザ

- **Google Chrome**（推奨）
- **Mozilla Firefox**
- **Apple Safari**
- **Microsoft Edge**

## ドキュメント

| ドキュメント | 説明 |
|-------------|------|
| [STRUCTURE.md](./STRUCTURE.md) | プロジェクト構成の詳細 |
| [DATABASE.md](./DATABASE.md) | データベーススキーマの詳細 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | コントリビューションガイドライン |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | 行動規範 |

## コントリビュートについて

このプロジェクトへのコントリビュートは大歓迎です。以下の流れを参考にしてください。

1. **Fork & Clone**
   - リポジトリを Fork し、ローカルに clone します。

2. **ブランチを作成**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **実装・修正**
   - 機能追加・バグ修正などを実施
   - TypeScript の型安全性を保つ
   - 可能であればテストも追加

4. **Commit & Push**
   - 変更を commit し、自分のリポジトリへ push
   - 内容を説明した **Pull Request** を作成

> 💡 **メモ**: Issue の作成、アイデア共有、Pull Request など、どんな形の参加も歓迎です。一緒に「誕生日をもっと楽しくするツール」を育てていきましょう。

## ライセンス

このプロジェクトは **[MIT ライセンス](LICENSE)** のもとで公開されています。商用・個人利用、改変・再配布など、自由にお使いいただけます（ライセンス条項に従う範囲で）。

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
</p>

---

<p align="center">
  <strong>特別な誕生日と、大切な人との時間のために。日本からも、世界からも、心を込めて。🎂🎉</strong>
</p>
