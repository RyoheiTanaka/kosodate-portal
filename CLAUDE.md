# CLAUDE.md

## シェルの使い分け

このリポジトリでの作業は **Git Bash（POSIX sh）** を前提とする。

- コミットメッセージなど複数行の文字列を渡すときは **ヒアドキュメント** を使う。
  PowerShell のヒアストリング記法（`@'...'@`）は Git Bash では構文エラーになるので使わない。

  ```bash
  git commit -F - <<'EOF'
  feat: 変更内容の要約

  詳細な説明。
  EOF
  ```

- パスは `/` 区切り、環境変数は `$VAR`、破棄先は `/dev/null`（`NUL` ではない）。

## MCP サーバー

`.mcp.json` で `mongodb`（readOnly）と `vercel` を定義している。

- **DBの中身を確認するときは MongoDB MCP を使う。** 調査目的で使い捨ての Node
  スクリプトを書かない（`dns.setServers()` の回避策も要らない）。接続先は
  `kosodate_dev` のみで、本番 `kosodate` は権限外。書き込みもできないので、
  データ更新は `scripts/import-nurseries.mjs` を使う。
- **本番の不具合は Vercel MCP で調べる。** まず `get_runtime_errors`（7日ぶんの
  集計。ログの保持期間より長く残る）、次に `get_runtime_logs`（保持は1日程度。
  `environment` を指定しないと preview のエラーを本番と取り違える）、
  ビルド失敗は `get_deployment_build_logs`（`errorsOnly: true`）。
  ID は固定なので毎回引き直さなくてよい:
  team `team_RemxcrDJAePNxAfrg6i6npal` / project `prj_TRuw8Zu4MJ3BtZJUAyDNZZ8Bchf2`。
  Web Analytics は未有効なので `get_web_analytics` は使えない。
