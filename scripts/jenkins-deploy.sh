#!/usr/bin/env bash
# Jenkins 部署：构建 apisrv → 同步产物到 DEPLOY_DIR → 安装生产依赖 → pm2 restart
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/ui-app/apisrv}"
PM2_APP_NAME="${PM2_APP_NAME:-ui-app-apisrv}"
PM2_ECOSYSTEM="${PM2_ECOSYSTEM:-$DEPLOY_DIR/ecosystem.config.cjs}"
SKIP_BUILD="${SKIP_BUILD:-}"
SKIP_PM2="${SKIP_PM2:-}"
PM2_RESTART_CMD="${PM2_RESTART_CMD:-}"

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
mkdir -p "$DEPLOY_DIR"
rm -rf "$DEPLOY_DIR/dist"
mkdir -p "$DEPLOY_DIR/dist"
cp -r "$REPO_ROOT/apisrv/dist/." "$DEPLOY_DIR/dist/"
cp "$REPO_ROOT/apisrv/package.json" "$DEPLOY_DIR/"
cp "$REPO_ROOT/ecosystem.config.cjs" "$DEPLOY_DIR/"

echo "========== install production deps =========="
(cd "$DEPLOY_DIR" && npm install --omit=dev)

if [[ "$SKIP_PM2" == "1" ]]; then
  echo "[SKIP] pm2 (SKIP_PM2=1)，产物已同步到 ${DEPLOY_DIR}"
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
export DEPLOY_DIR

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
