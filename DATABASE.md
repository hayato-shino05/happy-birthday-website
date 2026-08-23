# データベース

## 正本

データベーススキーマ、RLS、Storage、Realtime の正本は次のマイグレーションです。

- [`supabase/migrations/20260812163000_reset_and_create_anonymous_community.sql`](./supabase/migrations/20260812163000_reset_and_create_anonymous_community.sql)
- [`supabase/migrations/20260817000000_add_bulletin_post_likes.sql`](./supabase/migrations/20260817000000_add_bulletin_post_likes.sql)
- [`supabase/migrations/20260820000000_add_full_storage_buckets.sql`](./supabase/migrations/20260820000000_add_full_storage_buckets.sql)
- [`supabase/migrations/20260820000001_add_photo_album_storage.sql`](./supabase/migrations/20260820000001_add_photo_album_storage.sql)
- 初期データ: [`supabase/seed.sql`](./supabase/seed.sql)

[`database/database.sql`](./database/database.sql) は正本へのポインターです。DDL を追加しないでください。スキーマを変更するときは、新しい Supabase migration を追加します。

## 適用時の注意

正本 migration は `auth.users` を削除し、`public` スキーマを `CASCADE` で再作成します。既存のユーザー、テーブル、データを消去するため、開発用または明示的に初期化してよい環境だけで実行してください。

migration の適用後に `supabase/seed.sql` を実行すると、誕生日、メッセージ、ギフト、チャット、掲示板のサンプルデータを投入できます。

## public スキーマ

| テーブル | 用途 | 主な列 |
|---|---|---|
| `birthdays` | 誕生日情報 | `name`, `month`, `day`, `year`, `message` |
| `messages` | お祝いメッセージ | `sender`, `message`, `birthday_person`, `media_object_path` |
| `media_submissions` | Storage 上のメディア投稿のメタデータ | `object_path`, `media_kind`, `mime_type`, `size_bytes` |
| `virtual_gifts` | バーチャルギフト | `sender`, `gift_emoji`, `gift_name`, `birthday_person` |
| `chat_messages` | コミュニティチャット | `sender`, `message` |
| `bulletin_posts` | 掲示板投稿 | `sender`, `message`, `media_object_path`, `birthday_person`, `likes` |
| `post_replies` | 掲示板への返信 | `post_id`, `sender`, `message` |
| `music_tracks` | カスタム音楽トラック | `name`, `url`, `file_name`, `file_size` |

すべての ID は `bigint generated always as identity` です。日時は `timestamptz` で保存します。

`post_replies.post_id` は `bulletin_posts.id` を参照し、親投稿を削除すると返信も削除されます。

## 匿名アクセスと RLS

すべての `public` テーブルで RLS を有効にしています。`anon` ロールは全テーブルを閲覧でき、次のテーブルだけに作成できます。

- `messages`
- `media_submissions`
- `virtual_gifts`
- `chat_messages`
- `bulletin_posts`
- `post_replies`
- `music_tracks`

匿名の更新・削除ポリシーは定義していません。`birthdays` は匿名閲覧専用です。`bulletin_posts.likes` は直接更新できず、`increment_bulletin_post_likes(bigint)` RPC だけが原子的に 1 件加算し、更新後の件数を返します。この RPC は `anon` にだけ実行権限を付与し、関数内の `search_path` は空に固定しています。入力の文字数、メディア種別、サイズなどの制約は migration の `CHECK` 制約を正本として確認してください。

回帰確認は `__tests__/integration/production-snapshot-regression.test.ts` に固定しています。`birthdays`、`messages`、`media_submissions`、`virtual_gifts`、`chat_messages`、`bulletin_posts` の匿名 read/create-only 境界と `ThemeProvider` の render smoke を、Production の allowlist 統合とは独立に検証します。

## Storage

次の 5 つの公開バケットを使用します。

| バケット名 | 用途 | 1 ファイル上限 | 許可する MIME type |
|---|---|---|---|
| `photo-album` | フォトアルバム・思い出ギャラリー写真/動画 | 50 MiB | 画像全般 (HEIC/HEIF含む), MP4, WebM, QuickTime |
| `community-media` | 掲示板・チャットの写真・動画・音声メッセージ | 50 MiB | 画像, MP4, WebM, 音声各種 |
| `music` | カスタム BGM 音楽トラック | 15 MiB | MP3, WAV, OGG, WebM, FLAC, AAC |
| `avatars` | アバター・スタンプ画像 | 5 MiB | JPEG, PNG, WebP, GIF |
| `time-capsules` | タイムカプセル添付メディア | 50 MiB | 画像, MP4, WebM, 音声各種 |

匿名ユーザーは各バケットのオブジェクトを閲覧・作成できます。更新・削除は許可していません。

アプリケーションは URL ではなく Storage の object path を `media_object_path` または `object_path` に保存します。

## Realtime

Realtime publication に追加するテーブルは `public.chat_messages` のみです。ほかのテーブルを購読対象にする場合は、対応する migration で publication とアクセス設計を同時に変更してください。

## 変更手順

1. `supabase/migrations/` に新しい migration を追加します。
2. テーブル、制約、インデックス、RLS、Storage、Realtime の変更を同じ migration に記述します。
3. 必要なら `supabase/seed.sql` を新しい schema に合わせます。
4. この文書のテーブル一覧とアクセス契約を更新します。
