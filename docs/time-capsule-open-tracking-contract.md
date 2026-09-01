# Time Capsule Open Tracking Contract

## 対象

Open tracking は、invite token を使った認可済みの Time Capsule access に限定します。対象は解禁済み capsule の first open です。

- owner access は対象外です。
- 未解禁 capsule は対象外です。
- invite token 以外の識別子から recipient や identity を推測しません。
- reminder delivery とは別の処理として扱います。

## Identity と recipient boundary

invite token は bearer credential です。token の保有者を個人 identity として登録したり、recipient を推定したりしません。tracking の対象境界は、既存の invite token によって認可された capsule 1 件です。

別の利用者、別の capsule、recipient の連絡先、IP address、user agent、device fingerprint は tracking record に保存しません。

## 保存データ

初回開封時に `opened_at` だけを記録します。既存値がある場合は更新せず、同じ capsule の再アクセスで新しい open event を作成しません。

`opened_at` は UTC timestamp として保存します。content 配信に必要な認可済みデータと tracking metadata は分離し、tracking の保存失敗で認可済み content の配信を失敗させません。

## Retention と削除

tracking は capsule row の `opened_at` に限定します。独立した event log、PII、アクセス履歴、bearer token の plaintext は保存しません。capsule の所有者が capsule を削除または revoke した場合、`opened_at` も同じ row の削除・管理境界に従います。

個別の open event の export、notification、reminder delivery はこの contract の対象外です。

## 実装と検証

実装は `recordFirstOpen` と既存の Time Capsule access route を再利用します。unlocked invite GET、sealed invite GET、owner GET、tracking failure、duplicate first open を regression test で確認します。

Production schema、RLS、API の検証は repository test とは別の production read-only evidence が必要です。