# 匿名コミュニティ投稿の本番レート制限案

## 結論

現在の community submission は、browser の Supabase anon client から Storage と `media_submissions` へ直接書き込む経路です。repository には `/api/community` route はなく、community path で `service_role` も使っていません。このため、本書は現在の構成を説明するものではなく、実際の upload と insert を保護する境界を選定したうえで適用する将来の proposal です。

現状の直接書き込みに対して、存在しない endpoint の前段 limiter を想定しても quota は実際の書き込みへ届きません。実装時は、まず server endpoint へ経路を移すか、Supabase または採用する platform/provider 側で Storage upload と submission insert の両方を実際に受ける境界を選び、そこで共有 rate limit を適用します。`service_role` の導入はこの proposal の前提ではありません。

## 対象と境界

- 現在の write path は browser の Supabase anon client から `community-media` Storage と `media_submissions` へ直接書き込みます。
- 将来の limiter の endpoint または provider 境界は、実際の upload と insert の両方を保護できるものを実装前に選定します。`POST /api/community` は未実装の候補名に留め、現状の endpoint として扱いません。
- `sender`、`birthday_person`、`description` を対象 field とします。`sender` は必須で最大 100 文字、`birthday_person` と `description` は現在の source と同じく trim します。`content` や `birthdayPerson` はこの submission contract の field 名ではありません。
- 現在の media MIME・size validation と 50 MiB 上限を維持します。upload object と submission row の作成を同じ write quota の対象にします。
- read-only の `GET /api/media` はこの write quota と分離します。

## 推奨する本番設定

共有状態を持つ edge/platform rate limiter を、選定した実際の write boundary に置き、次の値を初期値として検討します。

- 1 client fingerprint あたり 10 requests / 10 minutes
- 1 client fingerprint あたり 50 requests / 24 hours
- request body の media 上限は既存の 50 MiB とし、multipart overhead を含む platform request limit は 50 MiB を超える値に設定します
- quota 超過時は HTTP `429`、安全な error envelope、`Retry-After` を返します
- `service_role`、request body、media content、raw IP を log に出しません
- client fingerprint は provider/platform が提供する ephemeral key を優先し、長期的な device fingerprint は作成しません

同一 client の共有 NAT を理由に global anonymous quota を置く場合は、正当な利用者を巻き込むため、値を実 traffic で再評価します。allowlist や bypass は追加しません。

## 実装前の確認

1. 現在の直接書き込みを保護する endpoint または provider 境界と、採用する共有 counter の retention を確定します。
2. 選定した境界が Storage upload と `media_submissions` insert の両方を確実に通過することを確認します。
3. limit key が cross-instance で共有されることを確認します。
4. `429` response、`Retry-After`、provider failure の挙動を staging で確認します。
5. Storage upload と insert failure の compensating cleanup が quota rejection の前に発生しないことを確認します。
6. production dashboard で accepted、rejected、upload failure、insert failure を分けて監視します。
7. 期限、通報、moderation、retention policy と値を運用担当が承認します。

## 未実施

この repository には provider credentials、production platform configuration、shared rate-limit store がなく、本番 rate limit はまだ設定されていません。migration、secret、deployment、provider account の変更はこの proposal では行いません。
