# 匿名コミュニティ投稿の本番レート制限案

## 結論

`/api/community` は未認証で `service_role` を使うため、本番ではアプリケーションのインスタンス内メモリだけに依存する rate limit を採用しません。現在の repository には共有状態を持つ rate-limit backend や provider integration がないため、この文書は production configuration の代わりではなく、適用前の proposal です。

## 対象と境界

- 対象 endpoint は `POST /api/community` です。
- `sender`、`content`、`birthdayPerson`、`description` の既存 length validation と、media MIME・size validation は維持します。
- upload された object と submission row の作成を rate limit の対象にします。
- read-only の `GET /api/media` はこの write quota と分離します。

## 推奨する本番設定

共有状態を持つ edge/platform rate limiter を endpoint の前段に置き、次の値を初期値として承認します。

- 1 client fingerprint あたり 10 requests / 10 minutes
- 1 client fingerprint あたり 50 requests / 24 hours
- request body の media 上限は既存の 50 MiB とし、multipart overhead を含む platform request limit は 50 MiB を超える値に設定します
- quota 超過時は HTTP `429`、安全な error envelope、`Retry-After` を返します
- `service_role`、request body、media content、raw IP を log に出しません
- client fingerprint は provider/platform が提供する ephemeral key を優先し、長期的な device fingerprint は作成しません

同一 client の共有 NAT を理由に global anonymous quota を置く場合は、正当な利用者を巻き込むため、値を実 traffic で再評価します。allowlist や bypass は追加しません。

## 実装前の確認

1. 採用する platform/provider と共有 counter の retention を確定します。
2. limit key が cross-instance で共有されることを確認します。
3. `429` response、`Retry-After`、provider failure の挙動を staging で確認します。
4. Storage upload と RPC failure の compensating cleanup が quota rejection の前に発生しないことを確認します。
5. production dashboard で accepted, rejected, upload failure, RPC failure を分けて監視します。
6. 期限、通報、moderation、retention policy と値を運用担当が承認します。

## 未実施

この repository には provider credentials、production platform configuration、shared rate-limit store がないため、本番 rate limit はまだ設定されていません。migration、secret、deployment、provider account の変更はこの proposal では行いません。
