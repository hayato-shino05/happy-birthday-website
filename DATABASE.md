# データベース

## 正本

データベーススキーマ、RLS、Storage、Realtime の正本は次のマイグレーションです。`supabase/migrations/` 配下の SQL ファイルだけを信頼し、`database/database.sql` は正本へのポインターです。DDL を追加しないでください。スキーマを変更するときは、新しい Supabase migration を追加します。

- [`supabase/migrations/20260812163000_reset_and_create_anonymous_community.sql`](./supabase/migrations/20260812163000_reset_and_create_anonymous_community.sql)
- [`supabase/migrations/20260817000000_add_bulletin_post_likes.sql`](./supabase/migrations/20260817000000_add_bulletin_post_likes.sql)
- [`supabase/migrations/20260820000000_add_full_storage_buckets.sql`](./supabase/migrations/20260820000000_add_full_storage_buckets.sql)
- [`supabase/migrations/20260820000001_add_photo_album_storage.sql`](./supabase/migrations/20260820000001_add_photo_album_storage.sql)
- [`supabase/migrations/20260821000000_add_time_capsules_table.sql`](./supabase/migrations/20260821000000_add_time_capsules_table.sql)
- [`supabase/migrations/20260823000000_harden_avatar_storage_mime_types.sql`](./supabase/migrations/20260823000000_harden_avatar_storage_mime_types.sql)
- [`supabase/migrations/20260824000000_expand_time_capsule_security.sql`](./supabase/migrations/20260824000000_expand_time_capsule_security.sql)
- [`supabase/migrations/20260824000001_contract_time_capsule_security.sql`](./supabase/migrations/20260824000001_contract_time_capsule_security.sql)
- [`supabase/migrations/20260824000002_rename_time_capsule_photo_constraint.sql`](./supabase/migrations/20260824000002_rename_time_capsule_photo_constraint.sql)
- [`supabase/migrations/20260824000003_remove_direct_time_capsule_access.sql`](./supabase/migrations/20260824000003_remove_direct_time_capsule_access.sql)
- [`supabase/migrations/20260825000000_limit_time_capsule_uploads.sql`](./supabase/migrations/20260825000000_limit_time_capsule_uploads.sql)
- [`supabase/migrations/20260825000001_add_time_capsule_access_codes.sql`](./supabase/migrations/20260825000001_add_time_capsule_access_codes.sql)
- [`supabase/migrations/20260825235454_add_time_capsule_private_access_boundary.sql`](./supabase/migrations/20260825235454_add_time_capsule_private_access_boundary.sql)
- [`supabase/migrations/20260825235535_harden_time_capsule_rpc_execute_privileges.sql`](./supabase/migrations/20260825235535_harden_time_capsule_rpc_execute_privileges.sql)
- [`supabase/migrations/20260826000000_add_time_capsule_access_attempt_buckets.sql`](./supabase/migrations/20260826000000_add_time_capsule_access_attempt_buckets.sql)
- [`supabase/migrations/20260826000001_add_time_capsule_private_access_boundary.sql`](./supabase/migrations/20260826000001_add_time_capsule_private_access_boundary.sql)
- [`supabase/migrations/20260826000002_harden_time_capsule_rpc_execute_privileges.sql`](./supabase/migrations/20260826000002_harden_time_capsule_rpc_execute_privileges.sql)
- [`supabase/migrations/20260827000000_add_time_capsule_open_tracking.sql`](./supabase/migrations/20260827000000_add_time_capsule_open_tracking.sql)
- [`supabase/migrations/20260827000002_remove_private_time_capsule_deny_policies.sql`](./supabase/migrations/20260827000002_remove_private_time_capsule_deny_policies.sql)
- [`supabase/migrations/20260827000003_add_notification_logs.sql`](./supabase/migrations/20260827000003_add_notification_logs.sql)
- [`supabase/migrations/20260827000004_harden_notification_claims.sql`](./supabase/migrations/20260827000004_harden_notification_claims.sql)
- 初期データ: [`supabase/seed.sql`](./supabase/seed.sql)

`20260825235454` と `20260825235535` は直後の `20260826000001` / `20260826000002` に同じ目的語句で上書きされますが、Supabase CLI のタイムスタンプ順で順次実行されるため両方を正本として残します。

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
| `time_capsules` | タイムカプセル本体 | `sender`, `recipient`, `message`, `photo_url`, `photo_object_path`, `unlock_date`, `owner_id`, `idempotency_key`, `invite_token_hash`, `invite_token_expires_at`, `invite_revoked_at`, `opened_at`, `created_at` |
| `time_capsule_access_codes` | 招待コードのハッシュ・派生情報 | `capsule_id`, `code_hash`, `derivation_attempt`, `revoked_at`, `failed_attempts`, `locked_until`, `last_used_at` |
| `time_capsule_access_attempt_buckets` | 招待コード入力のレート制限バケット | `bucket_fingerprint`, `failed_attempts`, `locked_until` |
| `notification_logs` | 通知ワーカーが処理するジョブ | `id`, `event_id`, `event_type`, `recipient_ref`, `channel`, `scheduled_at`, `timezone`, `idempotency_key`, `opted_in`, `status`, `attempt_count`, `last_error_code`, `next_attempt_at`, `expires_at`, `sent_at`, `leased_by`, `lease_until`, `created_at`, `updated_at` |

すべての ID は `bigint generated always as identity` (`time_capsule_access_codes` のみ `generated by default as identity`) です。日時は `timestamptz` で保存します (`time_capsules.unlock_date` のみ `date`)。

`post_replies.post_id` は `bulletin_posts.id` を参照し、親投稿を削除すると返信も削除されます。`time_capsule_access_codes.capsule_id` は `time_capsules.id` を参照し、親カプセルを削除するとコード行も削除されます。`bulletin_posts.likes` は `0` 以上を `CHECK` 制約で強制し、直接の `UPDATE` を許可せず `increment_bulletin_post_likes` 経由でのみ加算します。

## 匿名アクセスと RLS

すべての `public` テーブルで RLS を有効にしています。`anon` ロールは次の表だけを閲覧・作成できます。

- `birthdays` (SELECT のみ)
- `messages`
- `media_submissions`
- `virtual_gifts`
- `chat_messages`
- `bulletin_posts`
- `post_replies`
- `music_tracks`

匿名の更新・削除ポリシーは定義していません。`birthdays` は匿名閲覧専用です。`bulletin_posts.likes` は直接更新できず、`increment_bulletin_post_likes(bigint)` RPC だけが原子的に 1 件加算し、更新後の件数を返します。この RPC は `anon` にだけ実行権限を付与し、関数内の `search_path` は `''` に固定しています。入力の文字数、メディア種別、サイズなどの制約は migration の `CHECK` 制約を正本として確認してください。

### 認証必須・所有者境界のテーブル

次のテーブルは `anon` および `authenticated` ロールからすべての権限を剥奪し、`service_role` のみが操作します。アプリケーションは RPC 経由、または Supabase Functions などのサービスワーカー経由でアクセスします。

- `time_capsules`
- `time_capsule_access_codes`
- `time_capsule_access_attempt_buckets`
- `notification_logs`

`time_capsules.owner_id` は `auth.users(id)` を参照し、認証ユーザーが本人カプセルを所有していることを境界とします。`time_capsule_access_codes` は `capsule_id` で親カプセルに紐付き、招待コードのハッシュ (`code_hash`) を一意制約で管理します。`time_capsule_access_attempt_buckets` は 64 文字のフィンガープリントを主キーとし、`failed_attempts` と `locked_until` でレート制限を表現します。`notification_logs.idempotency_key` は `UNIQUE` で重複配送を防ぎ、`status` (`pending` / `processing` / `sent` / `retryable` / `failed` / `cancelled` / `expired`) をワーカーが遷移させます。

### タイムカプセル RPC

- `public.create_time_capsule_with_access_code(uuid, text, text, ...)` — `service_role` 専用。`time_capsules` と `time_capsule_access_codes` を 1 つのトランザクションで作成し、`owner_id` + `idempotency_key` の組み合わせで重複作成を防ぎます。
- `public.consume_time_capsule_access_code(text, text)` — `service_role` 専用。招待コードの照合、ロック判定、招待コードの revocation 状態 (`revoked_at is null`) と rate limit lockout (`locked_until <= now()`) を確認し、失敗カウンタをリセットしたうえで `capsule_id bigint` を返却します。
- `public.claim_notification_logs(text, timestamptz, integer)` — `service_role` 専用。`status` が `pending` / `retryable` の行を `processing` にリース (5 分間) して返却します。`search_path = public` に固定しています。

回帰確認は `__tests__/integration/production-snapshot-regression.test.ts` に固定しています。`birthdays`、`messages`、`media_submissions`、`virtual_gifts`、`chat_messages`、`bulletin_posts` の匿名 read/create-only 境界と `ThemeProvider` の render smoke を、Production の allowlist 統合とは独立に検証します。

## Storage

次の 6 つのバケットを使用します。`time-capsules` と `time-capsules-private` は `public = false` で、所有ユーザーとサービスワーカーだけがアクセスできます。

| バケット名 | 用途 | 公開 | 1 ファイル上限 | 許可する MIME type |
|---|---|---|---|---|
| `photo-album` | フォトアルバム・思い出ギャラリー写真/動画 | public | 50 MiB | 画像全般 (HEIC/HEIF 含む), MP4, WebM, QuickTime |
| `community-media` | 掲示板・チャットの写真・動画・音声メッセージ | public | 50 MiB | 画像, MP4, WebM, 音声各種 |
| `music` | カスタム BGM 音楽トラック | public | 15 MiB | MP3, WAV, OGG, WebM, FLAC, AAC |
| `avatars` | アバター・スタンプ画像 | public | 5 MiB | JPEG, PNG, WebP, GIF |
| `time-capsules` | タイムカプセル添付メディア (後方互換) | private | 50 MiB | 画像, MP4, WebM, 音声各種 |
| `time-capsules-private` | 認証ユーザー所有のタイムカプセル添付 | private | 50 MiB | `time-capsules` 設定を継承 |

`photo-album` / `community-media` / `music` / `avatars` / `time-capsules` では、`anon` ロールに `SELECT` と `INSERT` だけ許可し、`UPDATE` / `DELETE` は許可していません。`time-capsules-private` は `authenticated` ロールにのみアクセスを許可し、`storage.foldername(name)[1] = auth.uid()` で自分のフォルダだけに絞り込みます。`avatars` の MIME type は `20260823000000_harden_avatar_storage_mime_types.sql` で `image/svg+xml` を除外しています。

アプリケーションは URL ではなく Storage の object path を `media_object_path` または `object_path` に保存します。`time_capsules.photo_url` は `text` で外部 URL も許容しますが、`photo_object_path` は Storage のバケット内パスを保存する正規のフィールドです。

## Realtime

Realtime publication に追加するテーブルは `public.chat_messages` のみです。ほかのテーブルを購読対象にする場合は、対応する migration で publication とアクセス設計を同時に変更してください。

## 変更手順

1. `supabase/migrations/` に新しい migration を追加します。
2. テーブル、制約、インデックス、RLS、Storage、Realtime の変更を同じ migration に記述します。
3. 必要なら `supabase/seed.sql` を新しい schema に合わせます。
4. この文書のテーブル一覧とアクセス契約を更新します。
