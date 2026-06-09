# 部署指南：GitHub Actions + Jenkins + 1Panel

本仓库使用两套 CI/CD，职责分离：

| 组件 | 触发 | 部署内容 |
|------|------|----------|
| **GitHub Actions** | `dev` 分支 push（`admin/**` 变更） | 管理后台 `admin` → 1Panel 子路径 |
| **Jenkins** | `main` 等分支 push（Webhook） | `apisrv`、`client`（及历史 `admin` 产物到 `/opt/ui-app`） |

API 经 PM2 启动后由 1Panel 反向代理对外提供 `ts.cancan.asia` 服务。

## 架构

| 位置 | 内容 |
|------|------|
| GitHub Actions Runner | 构建 `admin/dist`（仅 CI 用，不保留在服务器） |
| `/www/wwwroot/ts.cancan.asia/admin/` | 管理后台静态资源（GitHub Actions 部署） |
| Jenkins 工作区 | 完整源码（仅 CI 构建用） |
| `/opt/ui-app/apisrv` | API 产物：`dist/`、`package.json`、生产 `node_modules` |
| `/opt/ui-app/admin` | Jenkins 历史 admin 产物（与 GitHub Actions 并存，可忽略） |
| `/opt/ui-app/client` | 客户端 H5 静态资源（`client/dist/build/h5`） |
| 1Panel 静态站 | `ts.cancan.asia` 静态资源 |
| 1Panel 反代 | 将 `/api` 请求转发到 `http://127.0.0.1:3000` |

---

## GitHub Actions：admin 部署到 1Panel 子路径

工作流文件：[`.github/workflows/deploy-admin-dev.yml`](../.github/workflows/deploy-admin-dev.yml)

### 触发条件

- 分支：`dev`
- 路径：`admin/**`、`package.json`、`package-lock.json`、workflow 文件本身

### 一次性准备

#### 1. 轮换 SSH 密钥（若私钥曾泄露）

在本地生成新密钥对（**勿将私钥提交到 git**）：

```bash
ssh-keygen -t ed25519 -C "github-actions-ui-app" -f ~/.ssh/ui-app-deploy -N ""
```

将公钥追加到服务器：

```bash
ssh-copy-id -i ~/.ssh/ui-app-deploy.pub root@8.210.195.66
```

在 GitHub 仓库 **Settings → Secrets and variables → Actions → New repository secret**：

| Secret 名称 | 值 |
|-------------|-----|
| `SSH_PRIVATE_KEY` | `~/.ssh/ui-app-deploy` 私钥全文（含 `BEGIN`/`END` 行） |

验证本地可登录：

```bash
ssh -i ~/.ssh/ui-app-deploy root@8.210.195.66 "echo ok"
```

#### 2. 创建部署目录

```bash
ssh root@8.210.195.66 "mkdir -p /www/wwwroot/ts.cancan.asia/admin"
```

#### 3. 1Panel Nginx：`/admin/` 子路径与 SPA 回退

1Panel → **网站** → `ts.cancan.asia` → **配置文件**，在 `server { }` 内、`location /` 之前添加：

```nginx
location /admin/ {
    alias /www/wwwroot/ts.cancan.asia/admin/;
    index index.html;
    try_files $uri $uri/ /admin/index.html;
}
```

若 `try_files` 回退不生效（部分 Nginx 版本对 `alias` 有限制），改用命名 location：

```nginx
location /admin/ {
    alias /www/wwwroot/ts.cancan.asia/admin/;
    index index.html;
    try_files $uri $uri/ @admin_fallback;
}

location @admin_fallback {
    rewrite ^/admin/.*$ /admin/index.html last;
}
```

保存后重载 Nginx。确认 `/api` 反代规则未受影响（仍指向 `127.0.0.1:3000`）。

#### 4. 创建并推送 `dev` 分支

```bash
git checkout -b dev   # 若尚未创建
git push -u origin dev
```

### 流水线阶段

1. **Install** — `npm ci`
2. **Build** — `VITE_BASE=/admin/ npm run build:admin`
3. **Deploy** — `rsync` 同步 `admin/dist/` 到 `root@8.210.195.66:/www/wwwroot/ts.cancan.asia/admin/`

### 验证

```bash
# 推送后查看 Actions 日志
git push origin dev

# 服务器上检查产物
ssh root@8.210.195.66 "ls -la /www/wwwroot/ts.cancan.asia/admin/"

# HTTP 检查
curl -I https://ts.cancan.asia/admin/
curl -I https://ts.cancan.asia/admin/login
```

浏览器访问 `https://ts.cancan.asia/admin/`，登录后确认 `/api` 请求正常。

### 常见问题

- **`Secret SSH_PRIVATE_KEY` 未配置**：Actions 在 SSH 步骤失败，按上文添加 Secret。
- **SSH 连接超时**：确认服务器 22 端口对公网开放（GitHub Actions 使用动态出口 IP）。
- **页面空白或资源 404**：检查构建是否带 `VITE_BASE=/admin/`，以及 Nginx `alias` 路径是否正确。
- **刷新 `/admin/login` 报 404**：Nginx 缺少 SPA `try_files` 回退，见上文配置。
- **API 请求失败**：确认 1Panel `/api` 反代仍指向 apisrv（Jenkins 部署）。

---

## Jenkins + 1Panel API 自动部署

GitHub 推送后，Jenkins 在同一台服务器上构建 `apisrv`，仅将打包产物同步到运行目录，经 PM2 启动后由 1Panel 反向代理对外提供 API 服务。

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
2. **Build** — `build:apisrv`、`build:admin`、`build:client`
3. **Deploy** — [`scripts/jenkins-deploy.sh`](../scripts/jenkins-deploy.sh)（`SKIP_BUILD=1`，默认 `SKIP_PM2=1` 不启动服务）

部署脚本将三端产物复制到对应目录；apisrv 额外执行 `npm install --omit=dev` 安装生产依赖。

## 环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `DEPLOY_DIR_APISRV` | `/opt/ui-app/apisrv` | API 部署目录 |
| `DEPLOY_DIR_ADMIN` | `/opt/ui-app/admin` | 管理后台部署目录 |
| `DEPLOY_DIR_CLIENT` | `/opt/ui-app/client` | 客户端 H5 部署目录 |
| `DEPLOY_DIR` | 同 `DEPLOY_DIR_APISRV` | 兼容旧变量名 |
| `PM2_APP_NAME` | `ui-app-apisrv` | PM2 进程名 |
| `SKIP_BUILD` | — | 设为 `1` 跳过构建（Jenkins Deploy 阶段使用） |
| `PM2_ECOSYSTEM` | `$DEPLOY_DIR/ecosystem.config.cjs` | PM2 配置文件（部署时自动复制到运行目录） |
| `SKIP_PM2` | — | 设为 `1` 仅同步产物，不执行 pm2 |
| `PM2_RESTART_CMD` | — | 自定义重启命令（Jenkins 在 Docker 内、PM2 在宿主机时使用） |

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

## Jenkins 跑在 Docker 里时

1Panel 反代指向宿主机 `127.0.0.1:3000`，API 进程必须在**宿主机网络**上监听 3000，不能只在容器内。

推荐 Docker 启动参数：

```bash
-v /opt/ui-app:/opt/ui-app          # 产物写到宿主机
--network host                       # 容器内 pm2 监听宿主机 3000
```

若 PM2 安装在**宿主机**、Jenkins 在容器里，可在 Jenkinsfile `environment` 增加：

```groovy
PM2_RESTART_CMD = 'ssh root@127.0.0.1 "cd /opt/ui-app/apisrv && pm2 restart ui-app-apisrv || pm2 start ecosystem.config.cjs --only ui-app-apisrv"'
```

或先只同步产物，再在宿主机手动启动：

```groovy
SKIP_PM2 = '1'
```

## 常见问题

- **`pm2: command not found`**：部署脚本会自动 `npm install -g pm2`；若 Jenkins 在 Docker 内，见上一节。
- **Jenkins 无写权限**：确认 `jenkins` 用户对 `/opt/ui-app` 可写，且能执行 `pm2`（建议与 PM2 进程属主一致）。
- **`npm ci` 失败**：确保根目录 `package-lock.json` 已提交到 git。
- **端口占用**：默认 `3000`；可通过 PM2 环境变量 `PORT` 修改，并同步更新 1Panel 反代目标。
- **Webhook 不触发**：检查 GitHub Webhook 最近交付记录与 Jenkins 系统日志。

## 扩展：静态前端

- **admin**：已由 GitHub Actions 部署到 `/www/wwwroot/ts.cancan.asia/admin/`（`dev` 分支）
- **client H5**：仍由 Jenkins 构建到 `/opt/ui-app/client`；若需部署到 1Panel 网站根目录，可将 `client/dist/build/h5/` rsync 到对应站点目录
