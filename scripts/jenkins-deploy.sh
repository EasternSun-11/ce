#!/usr/bin/env bash
# Jenkins 部署：构建 apisrv / admin / client → 同步产物到部署目录
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

DEPLOY_DIR_APISRV="${DEPLOY_DIR_APISRV:-${DEPLOY_DIR:-/opt/ui-app/apisrv}}"
DEPLOY_DIR_ADMIN="${DEPLOY_DIR_ADMIN:-/opt/ui-app/admin}"
DEPLOY_DIR_CLIENT="${DEPLOY_DIR_CLIENT:-/opt/ui-app/client}"

BUILD_DIR_APISRV="${BUILD_DIR_APISRV:-apisrv/dist}"
BUILD_DIR_ADMIN="${BUILD_DIR_ADMIN:-admin/dist}"
BUILD_DIR_CLIENT="${BUILD_DIR_CLIENT:-client/dist/build/h5}"

PM2_APP_NAME="${PM2_APP_NAME:-ui-app-apisrv}"
PM2_ECOSYSTEM="${PM2_ECOSYSTEM:-$DEPLOY_DIR_APISRV/ecosystem.config.cjs}"
SKIP_BUILD="${SKIP_BUILD:-}"
SKIP_PM2="${SKIP_PM2:-1}"
PM2_RESTART_CMD="${PM2_RESTART_CMD:-}"

sync_static() {
  local label="$1"
  local src="$2"
  local dest="$3"

  if [[ ! -d "$src" ]]; then
    echo "错误: ${label} 构建产物不存在: $src"
    exit 1
  fi

  echo "========== sync ${label} → ${dest} =========="
  mkdir -p "$dest"
  rm -rf "${dest:?}"/*
  cp -r "${src}/." "${dest}/"
}

echo "[Deploy] 仓库目录: $REPO_ROOT"
echo "[Deploy] apisrv → $DEPLOY_DIR_APISRV"
echo "[Deploy] admin  → $DEPLOY_DIR_ADMIN"
echo "[Deploy] client → $DEPLOY_DIR_CLIENT"

if [[ "$SKIP_BUILD" != "1" ]]; then
  echo "========== build all =========="
  (cd "$REPO_ROOT" && npm run build:apisrv)
  (cd "$REPO_ROOT" && npm run build:admin)
  (cd "$REPO_ROOT" && npm run build:client)
else
  echo "[SKIP] build (SKIP_BUILD=1)"
fi

sync_static "apisrv" "$REPO_ROOT/$BUILD_DIR_APISRV" "$DEPLOY_DIR_APISRV/dist"
cp "$REPO_ROOT/apisrv/package.json" "$DEPLOY_DIR_APISRV/"
cp "$REPO_ROOT/ecosystem.config.cjs" "$DEPLOY_DIR_APISRV/"

echo "========== install apisrv production deps =========="
(cd "$DEPLOY_DIR_APISRV" && npm install --omit=dev)

sync_static "admin" "$REPO_ROOT/$BUILD_DIR_ADMIN" "$DEPLOY_DIR_ADMIN"
sync_static "client" "$REPO_ROOT/$BUILD_DIR_CLIENT" "$DEPLOY_DIR_CLIENT"

if [[ "$SKIP_PM2" == "1" ]]; then
  echo "[SKIP] pm2 (SKIP_PM2=1)"
  echo "========== deploy done =========="
  exit 0
fi

ensure_pm2() {
  if command -v pm2 >/dev/null 2>&1; then
    return
  fi
  echo "[INFO] pm2 未找到，正在全局安装..."
  npm install -g pm2
  export PATH="$(npm prefix -g)/bin:${PATH:-}"
}

echo "========== pm2 restart =========="
export DEPLOY_DIR="$DEPLOY_DIR_APISRV"

if [[ -n "$PM2_RESTART_CMD" ]]; then
  echo "[INFO] 使用自定义重启命令: $PM2_RESTART_CMD"
  eval "$PM2_RESTART_CMD"
else
  ensure_pm2
  if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
    pm2 restart "$PM2_APP_NAME" --update-env
  else
    echo "应用 $PM2_APP_NAME 未运行，首次启动..."
    pm2 start "$PM2_ECOSYSTEM" --only "$PM2_APP_NAME"
  fi
  pm2 save
fi

echo "========== deploy done =========="
