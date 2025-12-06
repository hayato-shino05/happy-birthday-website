# 🗄️ データベーススキーマ

> Supabase (PostgreSQL) を利用した誕生日お祝いサイトのためのデータベース設計ドキュメントです。
>
> Next.js 側の API ルートや hooks は、ここで定義しているテーブル・ストレージ・ポリシーを前提に実装されています。

---

## 概要

このプロジェクトでは BaaS として **Supabase** を利用し、次の機能を組み合わせて構成しています。

- PostgreSQL データベース
- Realtime サブスクリプション
- メディアファイル用ストレージ
- Row Level Security (RLS)

アプリケーションからは Supabase の JavaScript クライアントを通して CRUD / サブスク / ストレージ操作を行います。

---

## テーブル定義（public スキーマ）

### `birthdays`

誕生日の基本情報を保持するメインテーブルです。カレンダー表示や次の誕生日計算のベースになります。

```sql
CREATE TABLE birthdays (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
  year INTEGER,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_birthdays_month_day ON birthdays(month, day);
```

| 列名 | 型 | 説明 |
|------|----|------|
| `id` | SERIAL | 主キー |
| `name` | VARCHAR(255) | 誕生日の本人の名前 |
| `month` | INTEGER | 誕生月（1〜12） |
| `day` | INTEGER | 誕生日（1〜31） |
| `year` | INTEGER | 生年（任意） |
| `message` | TEXT | カスタムメッセージ（任意） |
| `created_at` | TIMESTAMPTZ | レコード作成日時 |
| `updated_at` | TIMESTAMPTZ | 最終更新日時 |

---

### `custom_messages`

ゲストから送信されるお祝いメッセージを保存するテーブルです。テキストと任意のメディア URL を紐付けます。

```sql
CREATE TABLE custom_messages (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  birthday_person VARCHAR(255),
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_birthday_person ON custom_messages(birthday_person);
CREATE INDEX idx_messages_created_at ON custom_messages(created_at DESC);
```

| 列名 | 型 | 説明 |
|------|----|------|
| `id` | SERIAL | 主キー |
| `sender` | VARCHAR(255) | 送信者名 |
| `message` | TEXT | メッセージ本文（最大 1000 文字を想定） |
| `birthday_person` | VARCHAR(255) | メッセージの宛先（誕生日の本人） |
| `media_url` | TEXT | 添付メディアの URL |
| `created_at` | TIMESTAMPTZ | 作成日時 |

---

### `media_files`

アップロードされた写真・動画を管理するテーブルです。Supabase Storage 上の実体へのパスと、メタ情報を持ちます。

```sql
CREATE TABLE media_files (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'video')),
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  thumbnail_url TEXT,
  tags TEXT[],
  description TEXT,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_media_file_type ON media_files(file_type);
CREATE INDEX idx_media_tags ON media_files USING GIN(tags);
CREATE INDEX idx_media_created_at ON media_files(created_at DESC);
```

| 列名 | 型 | 説明 |
|------|----|------|
| `id` | SERIAL | 主キー |
| `file_name` | VARCHAR(255) | 元ファイル名 |
| `file_path` | TEXT | Storage 上のパス（公開 URL に変換可能） |
| `file_type` | VARCHAR(50) | `image` / `video` |
| `file_size` | INTEGER | ファイルサイズ（byte） |
| `width` | INTEGER | 画像 / 動画の幅 |
| `height` | INTEGER | 画像 / 動画の高さ |
| `duration` | INTEGER | 動画の長さ（秒） |
| `thumbnail_url` | TEXT | サムネイル画像の URL |
| `tags` | TEXT[] | タグ配列 |
| `description` | TEXT | 説明文 |
| `uploaded_by` | VARCHAR(255) | アップロードしたユーザー名 |
| `created_at` | TIMESTAMPTZ | 作成日時 |
| `updated_at` | TIMESTAMPTZ | 最終更新日時 |

---

### `virtual_gifts`

バーチャルギフト（絵文字＋名称）を送り合うためのテーブルです。

```sql
CREATE TABLE virtual_gifts (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  gift_emoji VARCHAR(10) NOT NULL,
  gift_name VARCHAR(100) NOT NULL,
  birthday_person VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gifts_birthday_person ON virtual_gifts(birthday_person);
CREATE INDEX idx_gifts_created_at ON virtual_gifts(created_at DESC);
```

| 列名 | 型 | 説明 |
|------|----|------|
| `id` | SERIAL | 主キー |
| `sender` | VARCHAR(255) | 送信者名 |
| `gift_emoji` | VARCHAR(10) | ギフトを表す絵文字 |
| `gift_name` | VARCHAR(100) | ギフト名 |
| `birthday_person` | VARCHAR(255) | 受け取り側の名前 |
| `created_at` | TIMESTAMPTZ | 送信日時 |

**デフォルトのギフト一覧（アプリ側で使用）**

| Emoji | 名称 |
|-------|------|
| 🎂 | バースデーケーキ |
| 💐 | 花束 |
| 🎈 | 風船 |
| 🎁 | ギフトボックス |
| 🎊 | 紙吹雪 |
| 🎉 | パーティーハット |
| 🧸 | ぬいぐるみ |
| 💝 | ハートのギフト |

---

### `audio_messages`

音声メッセージを管理するテーブルです。実体のファイルは Storage に保存され、その URL を保持します。

```sql
CREATE TABLE audio_messages (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  audio_url TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  birthday_person VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audio_birthday_person ON audio_messages(birthday_person);
CREATE INDEX idx_audio_created_at ON audio_messages(created_at DESC);
```

| 列名 | 型 | 説明 |
|------|----|------|
| `id` | SERIAL | 主キー |
| `sender` | VARCHAR(255) | 送信者名 |
| `audio_url` | TEXT | 音声ファイルの URL（Storage 上） |
| `duration` | INTEGER | 長さ（秒） |
| `birthday_person` | VARCHAR(255) | 宛先名 |
| `created_at` | TIMESTAMPTZ | 作成日時 |

---

### `video_messages`

動画メッセージを管理するテーブルです。サムネイル URL も保持します。

```sql
CREATE TABLE video_messages (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER DEFAULT 0,
  birthday_person VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_video_birthday_person ON video_messages(birthday_person);
CREATE INDEX idx_video_created_at ON video_messages(created_at DESC);
```

| 列名 | 型 | 説明 |
|------|----|------|
| `id` | SERIAL | 主キー |
| `sender` | VARCHAR(255) | 送信者名 |
| `video_url` | TEXT | 動画ファイルの URL |
| `thumbnail_url` | TEXT | サムネイル画像の URL |
| `duration` | INTEGER | 長さ（秒） |
| `birthday_person` | VARCHAR(255) | 宛先名 |
| `created_at` | TIMESTAMPTZ | 作成日時 |

---

### `bulletin_posts`

お祝い用のソーシャル投稿（掲示板）のメインテーブルです。いいね数もここで管理します。

```sql
CREATE TABLE bulletin_posts (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes INTEGER DEFAULT 0,
  birthday_person VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_created_at ON bulletin_posts(created_at DESC);
CREATE INDEX idx_posts_likes ON bulletin_posts(likes DESC);
```

| 列名 | 型 | 説明 |
|------|----|------|
| `id` | SERIAL | 主キー |
| `author` | VARCHAR(255) | 投稿者名 |
| `content` | TEXT | 投稿内容 |
| `image_url` | TEXT | 添付画像の URL |
| `likes` | INTEGER | いいね数 |
| `birthday_person` | VARCHAR(255) | 誕生日の本人 |
| `created_at` | TIMESTAMPTZ | 作成日時 |

---

### `bulletin_replies`

掲示板投稿に対する返信を保存するテーブルです。親投稿が削除された場合は CASCADE で一緒に削除されます。

```sql
CREATE TABLE bulletin_replies (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES bulletin_posts(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_replies_post_id ON bulletin_replies(post_id);
```

| 列名 | 型 | 説明 |
|------|----|------|
| `id` | SERIAL | 主キー |
| `post_id` | INTEGER | 親投稿の ID（`bulletin_posts.id`） |
| `author` | VARCHAR(255) | 返信者名 |
| `content` | TEXT | 返信内容 |
| `created_at` | TIMESTAMPTZ | 作成日時 |

---

## ストレージバケット

### `media` バケット

すべてのアップロードファイルを保存するメインバケットです。画像・動画・音声・サムネイルを同じバケット内でパスを分けて管理します。

```sql
-- バケット作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);

-- 公開読み取りポリシー
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- アップロード用ポリシー（匿名/認証いずれも可）
CREATE POLICY "Upload Access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media');
```

**ディレクトリ構成（推奨）**

```text
media/
├── uploads/           # 汎用アップロード
├── photos/            # ギャラリー用写真
├── videos/            # 動画ファイル
├── audio/             # 音声メッセージ
└── thumbnails/        # 動画サムネイル
```

**サポートするファイル種別（目安）**

| 種別 | 拡張子 | 最大サイズ |
|------|--------|------------|
| 画像 | jpg, png, gif, webp | 50MB |
| 動画 | mp4, webm, ogg | 50MB |
| 音声 | mp3, wav, ogg | 20MB |

---

## API エンドポイント（Next.js App Router）

アプリケーション側の `/app/api/**` ルートと DB スキーマの対応関係です。詳細な実装は各 `route.ts` を参照してください。

### Birthdays

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/birthdays` | 誕生日レコード一覧を取得 |
| POST | `/api/birthdays` | 誕生日レコードを新規作成 |
| GET | `/api/birthdays/[id]` | ID 指定で 1 件取得 |
| PUT | `/api/birthdays/[id]` | 誕生日レコードを更新 |
| DELETE | `/api/birthdays/[id]` | 誕生日レコードを削除 |
| GET | `/api/birthdays/check` | 今日が誰かの誕生日かどうかをチェック |
| GET | `/api/birthdays/next` | 次に来る誕生日を 1 件取得 |

**主なクエリパラメータ**

- `month` — 月でフィルタ
- `limit` — 取得件数の上限
- `orderBy` — ソート対象カラム
- `order` — `asc` / `desc`

---

### Messages

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/messages` | メッセージ一覧を取得 |
| POST | `/api/messages` | 新しいメッセージを作成 |
| GET | `/api/messages/[id]` | ID 指定で 1 件取得 |
| DELETE | `/api/messages/[id]` | メッセージを削除 |
| GET | `/api/messages/latest` | 最新メッセージを数件取得 |

**主なクエリパラメータ**

- `birthdayPerson` — 宛先名でフィルタ
- `limit` — 取得件数の上限
- `offset` — ページング用オフセット

---

### Media

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/media` | メディア一覧を取得 |
| GET | `/api/media/[id]` | ID 指定で 1 件取得 |
| DELETE | `/api/media/[id]` | メディアを削除 |
| GET | `/api/media/tags` | 使用中のタグ一覧を取得 |
| POST | `/api/upload` | ファイルをアップロードし、`media_files` にレコードを作成 |

**主なクエリパラメータ**

- `type` — `image` / `video`
- `tag` — タグでフィルタ
- `search` — ファイル名・説明文を部分一致検索
- `limit` — 取得件数の上限

---

### Gifts

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/gifts` | ギフト一覧を取得 |
| POST | `/api/gifts` | ギフトを送信（レコード作成） |
| GET | `/api/gifts/[id]` | ID 指定で 1 件取得 |
| DELETE | `/api/gifts/[id]` | ギフトを削除 |

---

### Audio Messages

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/audio` | 音声メッセージ一覧を取得 |
| POST | `/api/audio` | 新しい音声メッセージのレコードを作成 |

**主なクエリパラメータ**

- `birthdayPerson` — 宛先名でフィルタ
- `limit` — 取得件数の上限

---

### Video Messages

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/video` | 動画メッセージ一覧を取得 |
| POST | `/api/video` | 新しい動画メッセージのレコードを作成 |

**主なクエリパラメータ**

- `birthdayPerson` — 宛先名でフィルタ
- `limit` — 取得件数の上限

---

### File Upload

| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | `/api/upload` | Supabase Storage にファイルをアップロード |

**Request Body**: `multipart/form-data` 形式、フィールド名は `file`

**Response 例**:

```json
{
  "success": true,
  "data": { /* media_files レコード */ },
  "url": "https://..."
}
```

---

## Realtime サブスクリプション

Supabase の Realtime 機能を利用して、特定のテーブルの変更をフロントエンドに push 通知します。

```sql
-- Realtime を有効化するテーブル
ALTER PUBLICATION supabase_realtime ADD TABLE custom_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE bulletin_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE bulletin_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE virtual_gifts;
```

**クライアント側での購読例（TypeScript）**

```typescript
const subscription = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'custom_messages',
  }, (payload) => {
    // Realtime 更新をここで処理
  })
  .subscribe()
```

---

## Row Level Security (RLS)

このプロジェクトでは、基本的に「誰でも読み取り・挿入可能」なパブリック向けサービスとして設計しています。そのため RLS を有効化した上で、公開ポリシーを明示的に定義しています。

```sql
-- RLS を有効化
ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletin_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletin_replies ENABLE ROW LEVEL SECURITY;

-- 公開読み取りポリシー
CREATE POLICY "Public read" ON birthdays FOR SELECT USING (true);
CREATE POLICY "Public read" ON custom_messages FOR SELECT USING (true);
CREATE POLICY "Public read" ON media_files FOR SELECT USING (true);
CREATE POLICY "Public read" ON virtual_gifts FOR SELECT USING (true);
CREATE POLICY "Public read" ON bulletin_posts FOR SELECT USING (true);
CREATE POLICY "Public read" ON bulletin_replies FOR SELECT USING (true);

-- 公開挿入ポリシー
CREATE POLICY "Public insert" ON custom_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON media_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON virtual_gifts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON bulletin_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON bulletin_replies FOR INSERT WITH CHECK (true);
```

---

## データベース関数

### 次の誕生日を取得する関数 `get_next_birthday`

アプリの「次の誕生日」表示で利用するヘルパー関数です。単純化のため、月ごとの日数は 30 日として近似しています。

```sql
CREATE OR REPLACE FUNCTION get_next_birthday()
RETURNS TABLE (
  id INTEGER,
  name VARCHAR,
  month INTEGER,
  day INTEGER,
  days_until INTEGER
) AS $
DECLARE
  today_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
  today_day INTEGER := EXTRACT(DAY FROM CURRENT_DATE);
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.month,
    b.day,
    CASE 
      WHEN b.month > today_month OR (b.month = today_month AND b.day >= today_day)
      THEN (b.month - today_month) * 30 + (b.day - today_day)
      ELSE (12 - today_month + b.month) * 30 + (b.day - today_day)
    END AS days_until
  FROM birthdays b
  ORDER BY days_until ASC
  LIMIT 1;
END;
$ LANGUAGE plpgsql;
```

### いいね数をインクリメントする関数 `increment_likes`

掲示板投稿の `likes` を 1 増やし、その結果の値を返すシンプルな関数です。

```sql
CREATE OR REPLACE FUNCTION increment_likes(post_id INTEGER)
RETURNS INTEGER AS $
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE bulletin_posts 
  SET likes = likes + 1 
  WHERE id = post_id
  RETURNING likes INTO new_likes;
  
  RETURN new_likes;
END;
$ LANGUAGE plpgsql;
```

---

## セットアップ手順

### 1. Supabase プロジェクトの作成

1. [https://supabase.com](https://supabase.com) にアクセス
2. 新しいプロジェクトを作成
3. プロジェクトの URL と anon key を控えておく

### 2. マイグレーションの適用

Supabase の SQL Editor から、以下の順番でスクリプトを実行します。

1. テーブル定義の作成
2. インデックスの作成
3. RLS の有効化
4. ポリシーの作成
5. 関数の作成
6. ストレージバケットの作成

### 3. 環境変数の設定

Next.js 側の `.env.local` などに Supabase の接続情報を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## エンティティ関係図（ERD）

概念的な ERD は以下の通りです。実際の制約は SQL 定義を参照してください。

```text
┌─────────────┐     ┌──────────────────┐
│  birthdays  │     │  custom_messages │
├─────────────┤     ├──────────────────┤
│ id          │     │ id               │
│ name        │◄────│ birthday_person  │
│ month       │     │ sender           │
│ day         │     │ message          │
│ year        │     │ media_url        │
│ message     │     │ created_at       │
└─────────────┘     └──────────────────┘
       │
       │            ┌──────────────────┐
       │            │  virtual_gifts   │
       │            ├──────────────────┤
       └───────────►│ birthday_person  │
                    │ sender           │
                    │ gift_emoji       │
                    │ gift_name        │
                    └──────────────────┘

┌─────────────────┐     ┌───────────────────┐
│ bulletin_posts  │     │ bulletin_replies  │
├─────────────────┤     ├───────────────────┤
│ id              │◄────│ post_id           │
│ author          │     │ author            │
│ content         │     │ content           │
│ image_url       │     │ created_at        │
│ likes           │     └───────────────────┘
│ created_at      │
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│  media_files    │     │ audio_messages  │
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ file_name       │     │ sender          │
│ file_path       │     │ audio_url       │
│ file_type       │     │ duration        │
│ tags[]          │     │ birthday_person │
└─────────────────┘     └─────────────────┘
```
