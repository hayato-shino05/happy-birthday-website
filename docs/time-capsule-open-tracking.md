# Time Capsule open tracking contract

Open tracking は、正しい access boundary を通過し、server が unlocked content を返した最初の時点だけを記録します。sealed response では open event を作成しません。

## 最小限のデータ

- `capsule_id` または opaque な capsule reference
- UTC の `opened_at`

個人 identity、IP address、User-Agent、device fingerprint、raw invite token、raw access code、message、photo URL は保存しません。

## 記録ルール

- access が正しくても capsule が sealed の場合は記録しません
- access code または invite token が不正、revoked、expired の場合は記録しません
- capsule が最初に unlocked された時点で timestamp を一度だけ記録します
- 同じ capsule を再度 redeem しても timestamp を変更せず、duplicate event を作成しません
- Reminder delivery と open tracking は別の contract として扱います

## Boundary

Tracking は server-side access boundary で authorization が完了した後に実行し、public Data API には公開しません。persistence と retention の仕組みは、identity/privacy contract が明示的に承認されてから追加します。この PR では migration を作成せず、production の tracking も有効化しません。
