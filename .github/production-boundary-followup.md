# Production boundary follow-up

このファイルは、PR #60 でコード変更済みだが、production の実行証跡が未完了の項目を追跡する。

## 未完了項目

- [ ] 独立した read-only database session で `current_user`、`session_user`、role attributes、effective privileges、`SET ROLE` 到達可能 role を確認する
- [ ] production の RLS、table grants、Storage visibility、Storage policy、RPC execute grants、migration history を確認し、必要な差分を承認済み scope で扱う
- [ ] default branch `main` の daily healthcheck scheduler が `0 0 * * *`、`Asia/Tokyo` で稼働することを確認する
- [ ] GitHub Actions Secrets の保管、公開防止、失敗時の確認経路を確認する
- [ ] healthcheck の production run、ログ、失敗時の可視性を確認する
- [ ] Issue #2、#51、#55、#58 と関連 PR の checklist、証跡、最終 review を同期する

## 確認済みの範囲

- PR #60 で read-only healthcheck の timeout、secret validation、REST GET、table/schema/function/sequence privilege、`SET ROLE` 到達可能 role の検証を実装した
- PR #61 で workflow を default branch `main` に同期した
- production data、RLS、Storage policy、database grants、secret value はこの follow-up では変更しない

## 保留理由

production workflow の手動 dispatch は、現在の GitHub CLI account に Repository Admin 権限がないため実行できない。証跡が揃うまで、この項目と関連 Issue は open のまま維持する。
