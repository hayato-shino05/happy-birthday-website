# Omikuji History Contract

## Scope

Omikuji history は browser-local な機能です。Supabase には同期せず、同じ browser profile の localStorage に保存します。

## Identity

履歴の identity は browser profile と `OMIKUJI_HISTORY_STORAGE_KEY` の組み合わせです。ログインユーザーや共有アカウント単位の履歴ではありません。別の browser、private browsing session、localStorage を削除した環境では履歴を引き継ぎません。

## Date and timezone

日付は実行時の browser local timezone で `YYYY-MM-DD` に変換します。timezone を変更した場合、同じ瞬間でも日付の境界が変わるため、履歴と streak は変更後の local day として計算されます。UTC 日付や server timezone は使用しません。

## Daily rule

1 日に保存できる結果は 1 件です。同じ日付の結果を再保存した場合は既存 entry を置き換え、同じ日付を二重計上しません。現在の UI では当日結果が存在する場合、再抽選は行いません。

## Storage model

- Key: `omikuji_history_v1`
- Entry: `{ "date": "YYYY-MM-DD", "fortuneId": number }`
- 保存件数: 最新 7 件
- `fortuneId` は現在の `OMIKUJI_DATA` に存在する値だけを受け付けます

Parser は JSON、配列、日付、fortune ID を検証します。壊れた JSON、存在しない fortune、存在しない日付を含む値は履歴全体として無効とし、安全に空履歴へ戻します。旧形式の日次 key は現行 history へ移行します。

## Streak

streak は現在の local day から過去へ連続する日付だけを数えます。当日の entry がない場合は 0 です。欠落した日付がある時点で連続 streak は終了します。

## Privacy and retention

この機能は localStorage の値だけを扱い、history のために server identity、IP、device fingerprint、通知先、メッセージ本文を収集しません。保存上限は 7 件で、古い entry は新しい entry の追加時に削除されます。

## Out of scope

複数端末同期、アカウント間共有、server-side history、timezone の手動選択、streak に連動した報酬や通知はこの contract に含めません。
