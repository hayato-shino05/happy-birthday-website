# Omoide 実装ロードマップ

**対象:** 現在のリポジトリ実装と GitHub Issue / Pull Request の監査結果

**更新日:** 2026-09-02

**全体ステータス:** リポジトリ内の実装・契約は進行していますが、本番環境の独立証跡が必要な項目は未完了です。

**方針:** リポジトリの実装・テスト・契約と、本番環境の確認結果を分けて記録します。本番の schema、RLS、Storage policy、scheduler、provider 設定は、承認された範囲で独立に確認できるまで完了扱いにしません。

## 1. 現在の機能範囲

- 誕生日カウントダウン、Daily Omikuji 3D、写真・動画アルバム、slideshow、PhotoFrame
- Bulletin Board、メッセージ、チャット、匿名コミュニティ投稿、バーチャルギフト
- Time Capsule、クイズ、ミニゲーム、音楽プレイヤー、共有導線
- JA/EN i18n、レスポンシブ表示、モバイル向け bottom dock

## 2. ステータス一覧

| 区分 | ID | 内容 | 現在のステータス | 根拠と残課題 |
|---|---|---|---|---|
| 基盤 | B0 | Time Capsule の本番 schema、RLS、Storage、未開封データ境界 | 継続中 | 本番の独立確認が未完了です。 |
| 基盤 | V0 | targeted test、全体 test、build、lint、typecheck、diff check | 一部完了 | 各 Issue の検証結果を個別に記録します。 |
| 完了 | #45 | video thumbnail と未使用 export の整理 | 完了 | Issue #45 は クローズ済み、PR #71 は マージ済み です。リポジトリ 範囲 は完了しています。 |
| 完了 | #43 | Omikuji の履歴・streak | 完了 | Issue #43 は クローズ済み、PR #74 は マージ済み です。`localStorage`、browser-local history/streak 契約が確定しています。 |
| 完了 | #40 | Bulletin Board の Keepsake Export | 完了 | Issue #40 は クローズ済み、PR #73 は マージ済み です。native browser print による公開投稿の出力が リポジトリ 範囲 で完了しています。 |
| 完了 | #37 | Reminder 契約 | 完了 | Issue #37 は クローズ済み、PR #50 は マージ済み です。本番 接続は対象外です。 |
| 継続中 | #44 / F6 | Time Capsule open tracking | 本番 gate blocked | PR #75/#78 の実装・契約は マージ済みです。本番 schema、RLS、API の独立証跡が残っています。 |
| 継続中 | #2 | 匿名コミュニティ投稿と upload 経路 | リポジトリ 実装は大部分完了、本番証跡待ち | PR #81 は `70f68a0` として docs-only proposal を merge 済みです。PR #77/#79 は runtime を含む Draft のまま未 merge で、本番境界の確認項目が複数残っています。 |
| 計画 | F2 | Keepsake Export | リポジトリ 範囲 完了、証跡整理中 | 公開投稿の native print 実装は #40 で完了しました。 |
| 完了 | F5 | Omikuji History/Streak | リポジトリ範囲 complete | Issue #43 はクローズ済み、PR #74 はマージ済みです。repository implementation・contract・tests の範囲は完了しています。独立した roadmap-level evidence は別途取得していません。 |
| 継続中 | TD | 選択的 technical debt | 一部完了 | caller と 契約 を確認した範囲だけ整理します。 |

## 3. 完了した リポジトリ 範囲

### 3.1 #45: video thumbnail と未使用 export

- Issue #45 は クローズ済み です。
- PR #71 は マージ済み です。
- `generateVideoThumbnail` と `uploadThumbnail` の実利用を維持しました。
- caller を確認できない `generateThumbnailFromUrl` のみ削除しました。
- `countdownHeading` と共有型の `thumbnail_url` は利用中のため維持しました。
- この項目はリポジトリ範囲 complete です。本番対応準備や広範囲の cleanup 完了を意味しません。

### 3.2 #43: localStorage による Omikuji history/streak

- Issue #43 は クローズ済み です。
- PR #74 は マージ済み です。
- 保存先は `localStorage`、storage key は `omikuji_history_v1` です。
- 日付境界は browser local timezone/day です。
- 抽選は 1 日 1 回で、再抽選はありません。
- history は 7 日分を保持し、malformed/invalid data は安全に破棄します。
- identity と Supabase sync は持ちません。
- これは browser-local history/streak の リポジトリ 契約 complete を示します。

### 3.3 #40 / F2: native browser print による Keepsake Export

- Issue #40 はクローズ済み、PR #73 はマージ済みです。Issue と PR の記録では Bulletin Board の現在表示中の公開投稿を対象としています。
- 現在のリポジトリ実装では、`components/community/TimeCapsule.tsx` の `handleExport` が、開封済み Time Capsule の print window に `populateKeepsakePrintDocument` を適用します。
- print document に出力する値は `title`、`eventDate`、`sender`、`message`、任意の `photoUrl` です。`created_at` や `media_url` はこの実装の出力項目ではありません。
- `photoUrl` がある場合は画像を追加し、`waitForKeepsakePhoto` で読み込み・decode を待ってから print します。画像がない場合も print できます。
- JA/EN の title/date 表示、popup blocked、construction failure、画像の読み込み・decode failure に対する feedback と regression test があります。
- 元画面の state、animation、本番 data は変更しません。Issue #40 / PR #73 の Bulletin Board framing と、現行 source の Time Capsule export 実装は別の evidence として扱います。

### 3.4 #37 / R0・R1・R2: Reminder 契約

Issue #37 は クローズ済み、PR #50 は マージ済み です。リポジトリの Reminder 契約 範囲 は、ユーザー承認済みとして完了しています。

確定した契約:

- event は `birthday` と `capsule_unlock` です。
- recipient は server-side で解決した opaque な `recipientRef` です。
- channel は初期範囲を `in_app` に限定します。
- 明示的な opt-in を必須とします。
- timezone は IANA timezone、`scheduledAt` は UTC ISO 8601 timestamp です。
- retry は transient failure のみ、最大 3 回です。
- idempotency key は event・recipient・channel を含む stable な値です。
- 永続 failure は `failed` と safe error code で記録します。
- job/log に PII、本文、写真、secret、IP、device fingerprint を保存しません。
- `opened_at` は 90 日後に削除します。

本番 provider、scheduler、database migration、provider 実送信はこの契約の完了範囲に含みません。

## 4. #44 / F6: Open Tracking

Issue #44 は open のままです。PR #75/#78 のリポジトリ実装と privacy 契約はマージ済みですが、本番対応準備は未完了です。PR #75 の古い invite-token GET tracking は、Issue #44 の訂正と契約・PR #78 によって supersede されています。現行契約が追跡するのは POST access route だけで、通常の invite-token GET は対象外です。

### 確定した tracking boundary

- tracking 対象は invite token または access code を使う POST access route です。
- 記録する値は first-open の `opened_at` だけです。
- first-open は重複記録を防ぎます。
- 通常の invite-token GET は `recordFirstOpen` を呼ばず、tracking 対象外です。
- identity、recipient/link boundary、privacy、retention、削除方針は、対応する 契約 document に記録します。
- reminder delivery と tracking は分離します。

### 残る gate

- 本番 schema の独立確認
- 本番 RLS の独立確認
- 本番 API の独立確認

独立証跡が揃うまで、F6 を 本番 complete と記録しません。

## 5. #2: 匿名コミュニティ投稿と upload

Issue #2 は open です。PR #81 は `70f68a0` として merge 済みの docs-only proposal です。一方、PR #77 は runtime と migration/test を含む Draft のまま、PR #79 も runtime 側の Draft のままで、いずれも merge されていません。PR の CI 結果を本番 proof として扱いません。

### #2 で観察できた evidence

#### リポジトリの実装・契約

- 匿名ロールが作成できる操作は、許可されたメッセージ、メディア、ギフト、チャットに限定します。
- 匿名ロールによる誕生日データの作成・更新・削除を許可しません。
- 投稿済みのメッセージ、メディア、ギフト、音声、動画、掲示板投稿、返信、チャットの更新・削除を匿名アクセスから遮断します。
- `bulletin_posts` の公開 `UPDATE` 権限を廃止し、いいね操作は既存 RPC 経由にします。
- ブラウザからの直接 upload と API 経由 upload を一つの方針に統一します。
- upload 入力、MIME、容量、保持期間、通報・モデレーション方針をリポジトリ契約と test で確認します。

#### 本番で観察した read-only snapshot

- 現 MCP session の read-only catalog では、`exam` が `ACTIVE_HEALTHY` で、community 関連 table の RLS、匿名 role の確認範囲における `SELECT` / `INSERT`、`birthdays` の `SELECT` のみを確認しました。
- `community-media` は public、50 MiB、image/video/audio allowlist、`avatars` は public、5 MiB、JPEG/PNG/WebP/GIF でした。確認した `storage.objects` policy は匿名 `SELECT` / `INSERT` のみで、`UPDATE` / `DELETE` は確認されませんでした。
- healthcheck workflow の schedule は毎日 1 回（`0 0 * * *`、`Asia/Tokyo`）です。直近 5 run は失敗し、最新 run は REST HTTP `401` でしたが、secret はログ上 `***` にマスクされ、失敗 workflow/log の可視性は確認できました。
- これらは現 MCP session で観察した catalog、policy、schedule、masking/failure visibility の snapshot であり、独立 identity による attestation ではありません。

### 残る gate

- independent identity による本番 Storage/RLS/catalog attestation
- 本番の `create_community_submission` RPC に関する migration/apply、routine privilege、実行確認
- default branch からの scheduler の successful production run
- scheduler secret の target mapping と成功経路の確認（masking/failure visibility は観察済み）
- production rate-limit enforcement
- platform body-limit と large-media deployment boundary の決定・確認

上記 gate と、PR #77/#79 の merge 状態が解消されるまで、Issue #2 を complete としません。PR #81 の docs-only merge や CI が green であっても、本番 acceptance の代わりにはなりません。

## 6. ロードマップ

### Batch 0: discovery と 本番 safety

**ステータス:** 継続中

- Time Capsule の schema、RLS、Storage、未開封データ境界を read-only の方法で確認します。
- local、test、本番の差分を記録します。
- `git diff --check`、targeted test、全体 test、build、lint、typecheck の結果を、まとめて一つの成功判定にせず個別に記録します。

### Batch 1: LINE Share と Time Capsule hardening

**ステータス:** リポジトリ 実装済み。本番 関連の確認は Batch 0 に従います。

- LINE share の URL encode、accessible label、JA/EN、既存 fallback を維持します。
- Time Capsule の remote/local parsing、malformed data、locked/unlocked、upload/insert failure を境界で処理します。

### Batch 2: Reminder

**ステータス:** R0・R1・R2 の リポジトリ 契約 範囲 complete。本番 接続は未着手です。

- R0 は `birthday` / `capsule_unlock`、`recipientRef`、`in_app`、opt-in、IANA/UTC を確定済みです。
- R1 は notification log schema proposal と privacy/retention 制約を リポジトリ に保持します。
- R2 は bounded retry、idempotency、opt-out、`failed` state を test で確認します。
- 本番 scheduler、migration、provider 実送信は別の本番対応準備の範囲とします。

### Batch 3: Keepsake Export

**ステータス:** F2 の Issue #40 はクローズ済み、PR #73 はマージ済みです。現行リポジトリでは、開封済み Time Capsule の export 実装を確認しています。

- `handleExport` が `populateKeepsakePrintDocument` を呼び、native browser print layout を構築します。
- 出力項目は `title`、`eventDate`、`sender`、`message`、任意の `photoUrl` です。`created_at` は使用しません。
- `waitForKeepsakePhoto` が画像の読み込み・decode を待ち、画像がない場合も export を継続します。
- Issue #40 / PR #73 に記録された Bulletin Board の公開投稿 export と、現行 source にある Time Capsule export は同一視せず、各 evidence の対象を分けて記録します。

### Batch 4: Contributor Prompts と Omikuji History

**Contributor Prompts:** リポジトリ 実装・test 済みです。

**F5 Omikuji History/Streak:** リポジトリ範囲 complete です。Issue #43 はクローズ済み、PR #74 はマージ済みで、browser-local history/streak の repository implementation・contract・tests が完了しています。独立した roadmap-level evidence は別途取得していません。

### Batch 5: Open Tracking と technical debt

**F6 Open Tracking:** 本番 gate blocked です。invite token/access code の POST access route、`opened_at` only、通常の invite-token GET は対象外という boundary を維持し、本番 schema/RLS/API の独立 証跡 を待ちます。

**Technical debt:** caller と 契約 を確認した項目だけ整理します。大量の dead export 削除は行いません。

## 7. 検証方針

- リポジトリの 実装、契約、test、CI と 本番の独立証跡を別々に記録します。
- 本番 schema、RLS、Storage policy、migration、scheduler、provider、secret、rate limit、body limit は、リポジトリ test や CI の成功だけでは完了扱いにしません。
- 検証していない manual 証跡 や 本番 success run を推測して記録しません。
- 仕様変更時は、対応する Issue、契約 document、test、関連 README / docs の整合性を確認します。
- 本番 へ migration、RLS、Storage policy、scheduler、provider 設定を適用する場合は、別途承認された作業として扱います。

## 8. 完了条件

ロードマップ全体は、次の条件をすべて満たすまで完了としません。

- LINE Share と Time Capsule hardening の リポジトリ verification が揃っている。
- Time Capsule の 本番 schema、Storage、RLS、未開封データ境界を独立に確認している。
- Reminder 契約 の承認済み範囲と 本番 接続範囲を分離している。
- Keepsake Export は閲覧権限のある表示中データだけを出力する。
- #44 の 本番 schema/RLS/API 証跡 が揃っている。
- #2 の PR、本番 attestation、RPC migration/apply、scheduler success、secret/failure、rate-limit、body-limit/large-media boundary が確認できている。
- F5 は Issue #43 と PR #74 が示す repository implementation・contract・tests の範囲で complete とします。独立した roadmap-level evidence は別途取得していません。
- targeted test、全体 test、build、lint、typecheck、`git diff --check` の結果を実行範囲とともに記録している。
