#!/usr/bin/env bash
#
# ビルド済みの .output を起動して、実際にページが返るかを確認する。
#
# ビルドが通っても実行時に壊れていることがある。Nuxt 4 移行で踏んだ
# 「アイコンが全て非表示」「ページが 500」は、どちらもビルド成功のまま起きた。
#
# DB が要るページ（/nurseries 系）は CI から Atlas に繋げないため対象外。
#
# 事前に `npm run build` が済んでいること。
set -euo pipefail

PORT="${PORT:-3000}"
BASE="http://localhost:${PORT}"

PORT="$PORT" node .output/server/index.mjs &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

echo "サーバーの起動を待機"
for i in $(seq 1 60); do
  if curl -sf -o /dev/null "${BASE}/contact"; then
    echo "起動を確認"
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "::error::サーバーが 60 秒以内に起動しなかった"
    exit 1
  fi
  sleep 1
done

echo "静的ページが 200 を返すか"
for path in / /contact /privacy /terms /license; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "${BASE}${path}")
  echo "  $code $path"
  if [ "$code" != "200" ]; then
    echo "::error::$path が $code を返した"
    exit 1
  fi
done

echo "アイコンが解決できているか"
# @iconify-json/* が抜けると、ビルドは通るのにアイコンが一切出なくなる
curl -sf "${BASE}/contact" -o /tmp/ci-smoke-page.html
if ! grep -q 'i-heroicons:' /tmp/ci-smoke-page.html; then
  echo "::error::heroicons のクラスが SSR 出力に無い。@iconify-json/heroicons の導入を確認"
  exit 1
fi
echo "  検出: $(grep -o 'i-heroicons:[a-z0-9-]*' /tmp/ci-smoke-page.html | sort -u | tr '\n' ' ')"

echo "404 が 404 を返すか"
code=$(curl -s -o /dev/null -w '%{http_code}' "${BASE}/no-such-page")
if [ "$code" != "404" ]; then
  echo "::error::存在しないパスが $code を返した"
  exit 1
fi

echo "スモークテスト成功"
