# Reminder 契約

## 対象イベント

- `birthday`: 誕生日の通知
- `capsule_unlock`: Time Capsule の開封日時通知

## Recipient と identity

通知先は server-side で解決した opaque な `recipientRef` で表します。メールアドレス、LINE ID、本文、写真、raw token は job や log に保存しません。

## Channel

`in_app`、`email`、`web_push`、`line` を契約上の候補とします。provider 送信は channel ごとの opt-in と実装承認が完了するまで無効にします。現在の pure Engine は provider boundary を受け取るだけで、送信先を直接呼び出しません。

## Timing と timezone

`scheduleAt` は UTC の ISO 8601 timestamp、`timezone` は IANA timezone とします。過去の job は即時実行せず、scheduler 側で扱いを決定します。期限を過ぎた job は `expired` として扱います。

## Retry と idempotency

`idempotencyKey` は event、recipient、channel を含む stable な値とします。同じ key は一度だけ provider に渡します。retry は transient failure に限り、最大試行回数を超えません。永続的な failure は `failed` として記録します。

## Opt-out と retention

`optedIn=false` の recipient には送信しません。job/log は最小限の metadata と safe error code だけを保持し、本文、写真、secret、IP、device fingerprint は保持しません。具体的な retention 期間は production storage を追加する前に承認します。

## 承認境界

この PR では contract と pure domain validation のみを追加します。production scheduler、database migration、provider への実送信は実行しません。
