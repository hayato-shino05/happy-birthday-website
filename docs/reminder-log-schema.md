# Reminder log schema proposal

この proposal は #37 の contract を実装へ渡すための最小構造です。本番 migration は実行しません。

| Field | 型 | 方針 |
| --- | --- | --- |
| `event_id` | text | 必須。birthday または capsule unlock の event 識別子 |
| `event_type` | enum | `birthday` または `capsule_unlock` |
| `recipient_ref` | text | server-side の opaque reference。連絡先を平文保存しない |
| `channel` | enum | `in_app`、`email`、`web_push`、`line` |
| `scheduled_at` | timestamptz | UTC の実行予定時刻 |
| `timezone` | text | IANA timezone |
| `status` | enum | `pending`、`processing`、`sent`、`retryable`、`failed`、`cancelled`、`expired` |
| `attempt_count` | integer | 0 以上。bounded retry 用 |
| `last_error_code` | text | provider の safe error code だけ |
| `idempotency_key` | text | 必須かつ unique。重複送信を防止 |
| `sent_at` | timestamptz | 送信完了時刻。未送信は null |
| `created_at` | timestamptz | 作成時刻 |
| `updated_at` | timestamptz | 更新時刻 |

## Constraint と index proposal

- `idempotency_key` は unique にする
- `attempt_count` は 0 以上にする
- `scheduled_at`、`sent_at`、`created_at` は UTC として扱う
- `status, scheduled_at` の複合 index で due job を取得する
- opt-out 判定に必要な `recipient_ref` の index は retention 契約と query が確定してから追加する

## 保存しない情報

message、photo URL、access token、secret、IP address、User-Agent、device fingerprint、provider credential は保存しません。retention 期間は contract 承認後に決定し、未承認の migration は作成しません。
