# Reminder と Time Capsule の lifecycle 方針

この文書は、Reminder と Time Capsule の lifecycle を同じレビュー単位で扱うための作業範囲を定義します。実装前に契約と privacy 境界を確認し、未承認の scheduler、migration、外部通知、tracking 有効化を行わないことを前提にします。

## 対象 Issue

- #37 Reminder の recipient・channel 契約
- #38 Reminder log の schema proposal
- #39 Reminder Engine の重複防止と失敗処理
- #44 Time Capsule の open tracking と privacy 契約

## 実施順序

1. recipient、channel、identity、opt-in/opt-out、timezone、retry、idempotency、retention を定義する
2. notification log と open tracking の保存項目、制約、認可境界を proposal 化する
3. 承認済みの契約だけを Reminder Engine と最小 tracking 実装へ渡す
4. targeted test、typecheck、lint、build、diff check を実行する

## 保持しない情報

- plaintext secret
- Time Capsule の本文や写真
- 不要な IP アドレス
- device fingerprint

本番データベースへの DDL/DML、production scheduler の有効化、外部 provider への実送信は、明示的な承認と別の検証手順が完了するまで実行しません。
