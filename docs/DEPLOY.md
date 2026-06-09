# Jenkins + 1Panel API 自动部署

GitHub 推送后，Jenkins 在同一台服务器上构建 `apisrv`，仅将打包产物同步到运行目录，经 PM2 启动后由 1Panel 反向代理对外提供 `ts.cancan.asia` API 服务。

## 架构

| 位置 | 内容 |
|------|------|
| Jenkins 工作区 | 完整源码（仅 CI 构建用） |
| `/opt/ui-app/apisrv` | 生产运行目录：`dist/`、`package.json`、生产 `node_modules` |
| 1Panel 静态站 | `ts.cancan.asia` 静态资源（手动配置，与 API 部署独立） |
| 1Panel 反代 | 将 API 请求转发到 `http://127.0.0.1:3000` |

## 服务器一次性准备

### 1. 创建运行目录

```bash
sudo mkdir -p /opt/ui-app/apisrv
sudo chown -R jenkins:jenkins /opt/ui-app   # 按实际 Jenkins 运行用户调整
```

### 2. 运行时依赖

- Node.js 18+
- PM2：`npm i -g pm2`
- 开机自启：`pm2 startup`（按提示执行）→ 首次部署后 `pm2 save`

### 3. Jenkins 任务

1. 新建 **Pipeline** 任务 → **Pipeline script from SCM** → 选择本仓库
2. **Credentials**：GitHub SSH 密钥或 PAT（读仓库）
3. **构建触发器**：勾选 **GitHub hook trigger for GITScm polling**
4. Script Path：`Jenkinsfile`

### 4. GitHub Webhook

仓库 **Settings → Webhooks → Add webhook**：

| 项 | 值 |
|----|-----|
| Payload URL | `https://<jenkins-host>/github-webhook/` |
| Content type | `application/json` |
| 事件 | Just the push event |

若 Jenkins 在内网，需公网反代或内网穿透；否则可改用 **Poll SCM**（如 `H/5 * * * *`）。

### 5. 1Panel 反向代理核对

1Panel → **网站** → `ts.cancan.asia` → **反向代理**：

| 项 | 建议值 |
|----|--------|
| 代理目标 | `http://127.0.0.1:3000` |
| 路径 | `/api` 或按现有静态站分流规则 |
| 健康检查 | `GET /health` → `{"status":"ok",...}` |

## 流水线阶段

[`Jenkinsfile`](../Jenkinsfile) 三阶段：

1. **Install** — `npm ci`（根目录需有 `package-lock.json`）
2. **Build** — `npm run build:apisrv`
3. **Deploy** — [`scripts/jenkins-deploy.sh`](../scripts/jenkins-deploy.sh)（`SKIP_BUILD=1`）

部署脚本将 `apisrv/dist/` 与 `package.json` 复制到 `DEPLOY_DIR`，执行 `npm install --omit=dev`，再 `pm2 restart`。

## 环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `DEPLOY_DIR` | `/opt/ui-app/apisrv` | API 生产运行目录 |
| `PM2_APP_NAME` | `ui-app-apisrv` | PM2 进程名 |
| `SKIP_BUILD` | — | 设为 `1` 跳过构建（Jenkins Deploy 阶段使用） |
| `PM2_ECOSYSTEM` | 仓库根 `ecosystem.config.cjs` | PM2 配置文件路径 |

## 首次手动部署

```bash
cd /path/to/jenkins/workspace/<job-name>
npm ci
npm run build:apisrv
chmod +x scripts/jenkins-deploy.sh
DEPLOY_DIR=/opt/ui-app/apisrv ./scripts/jenkins-deploy.sh

# 验证
curl -s http://127.0.0.1:3000/health
curl -s https://ts.cancan.asia/health
pm2 logs ui-app-apisrv --lines 50
```

## 常见问题

- **Jenkins 无写权限**：确认 `jenkins` 用户对 `/opt/ui-app` 可写，且能执行 `pm2`（建议与 PM2 进程属主一致）。
- **`npm ci` 失败**：确保根目录 `package-lock.json` 已提交到 git。
- **端口占用**：默认 `3000`；可通过 PM2 环境变量 `PORT` 修改，并同步更新 1Panel 反代目标。
- **Webhook 不触发**：检查 GitHub Webhook 最近交付记录与 Jenkins 系统日志。

## 扩展：静态前端

若后续要将 H5 或管理后台纳入自动部署，在 Jenkinsfile 增加 `build:client` / `build:admin`，并将产物 rsync 到 1Panel 网站根目录：

- H5：`client/dist/build/h5/`
- Admin：`admin/dist/`
