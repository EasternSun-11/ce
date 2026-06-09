#!/usr/bin/env bash
# Jenkins 部署：构建 apisrv → 同步产物到 DEPLOY_DIR → 安装生产依赖 → pm2 restart
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/ui-app/apisrv}"
PM2_APP_NAME="${PM2_APP_NAME:-ui-app-apisrv}"
PM2_ECOSYSTEM="${PM2_ECOSYSTEM:-$REPO_ROOT/ecosystem.config.cjs}"
SKIP_BUILD="${SKIP_BUILD:-}"

echo "[Deploy] 仓库目录: $REPO_ROOT"
echo "[Deploy] 运行目录: $DEPLOY_DIR"
echo "[Deploy] PM2 应用: $PM2_APP_NAME"

if [[ "$SKIP_BUILD" != "1" ]]; then
  echo "========== build apisrv =========="
  (cd "$REPO_ROOT" && npm run build:apisrv)
else
  echo "[SKIP] build apisrv (SKIP_BUILD=1)"
fi

if [[ ! -d "$REPO_ROOT/apisrv/dist" ]]; then
  echo "错误: 构建产物不存在: $REPO_ROOT/apisrv/dist"
  exit 1
fi

echo "========== sync artifacts =========="
mkdir -p "$DEPLOY_DIR/dist"
rsync -a --delete "$REPO_ROOT/apisrv/dist/" "$DEPLOY_DIR/dist/"
rsync -a "$REPO_ROOT/apisrv/package.json" "$DEPLOY_DIR/"

echo "========== install production deps =========="
# apisrv 无独立 package-lock.json，使用 npm install --omit=dev
(cd "$DEPLOY_DIR" && npm install --omit=dev)

echo "========== pm2 restart =========="
export DEPLOY_DIR
if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME" --update-env
else
  echo "应用 $PM2_APP_NAME 未运行，首次启动..."
  pm2 start "$PM2_ECOSYSTEM" --only "$PM2_APP_NAME"
fi
pm2 save

echo "========== deploy done =========="
