# 残存課題の実装計画

日付: 2026-08-27
対象: Issue #51 / `chore/remaining-quality-ux-hardening`
状態: Draft

## 目的

`1.0.0` の監査で残った運用品質、Time Capsule UX、アクセシビリティ、Reminder 永続化、文書整合性を Issue #51 と Draft PR の単位で整理します。実装は小さく分け、各項目を検証してから次へ進みます。

## 監査で確認された残存課題

- #2 に紐づく本番 `healthcheck`、RLS、scheduler、secret の境界が未分離です。
- `DATABASE.md` と Time Capsule の実装・migration・アクセス境界に確認が必要です。
- Time Capsule の作成失敗後に残る local pending 状態、retry 表示、Unlock Date の label association、mobile touch target、Access code の copy・再確認・handoff UX が未完了です。
- Reminder の durable idempotency、scheduler、notification log の設計境界と、既存 22 件の lint warning、Node 22 での clean build を確認する必要があります。

## 今回の対象

1. #2 の運用項目を、本番変更なしで read-only 確認と承認境界の記録に分けます。
2. `DATABASE.md`、`docs/time-capsule-open-tracking.md`、関連 migration と実装の記述を照合します。
3. 未追跡 migration `supabase/migrations/20260827000002_remove_private_time_capsule_deny_policies.sql` は remote schema との照合後に扱いを決めます。
4. Time Capsule の失敗復旧、retry、label、touch target、Access code handoff を対象に、必要最小限の実装と回帰確認を行います。
5. Reminder は `lib/reminders/engine.ts` と `docs/reminder-log-schema.md` を基準に、永続化・scheduler・重複防止の契約を確定します。
6. Issue #51 のサブタスク、Draft PR の実装項目、検証結果を同期します。

## 対象外と承認境界

- #40、#41、#43、#45 の実装は独立 Issue で管理し、今回の変更に混在させません。
- 本番 RLS、production scheduler の有効化、secret の登録・変更、PostgreSQL の更新は、明示的な承認と証跡なしに実行しません。
- 未承認の本番 migration、Storage policy 変更、外部 provider への実送信、無関係な生成物の削除は行いません。

## 実施順

1. 既存 migration、`DATABASE.md`、Time Capsule の API・server・client・テストを read-only で照合する。
2. P1 の失敗復旧と Unlock Date のアクセシビリティを先に扱い、P2 の mobile と Access code UX を続ける。
3. Reminder の契約と durable idempotency の境界を記録し、承認が必要な作業を分離する。
4. Issue #51 の受入条件、scope、review、CI、セキュリティ境界を最終確認する。

## 検証コマンド

```bash
git diff --check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

`npm test -- --runInBand` は Vitest の実行方法ではないため使用しません。Node 22 での clean build と、22 件の既存 lint warning の分類結果は別途記録します。

## 未確認事項

- 本番の `time_capsules`、`time-capsules` bucket、RLS、Storage policy、scheduler、secret の実状態。
- sealed capsule の `message` と `photo_url` が client/API response に含まれないこと。
- 未追跡 migration が remote schema と一致するか、適用対象かどうか。
- 実機を含む mobile touch target と Access code handoff の利用結果。
- Node 22 clean build の環境差、既存 lint warning の発生元と修正要否。
- Reminder の retention、削除ジョブ、provider 境界を本番へ進めるための承認者と運用手順。
