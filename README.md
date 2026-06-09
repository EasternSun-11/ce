# ui-app — 多端 Monorepo

项目已拆分为三个子目录：

| 目录 | 说明 |
|------|------|
| `apisrv/` | Node.js 服务端（登录 API、首页数据、健康检查） |
| `admin/` | Vue 3 管理后台（登录 + 首页） |
| `client/` | Uni-app 客户端（H5 / 微信小程序 / Android / 鸿蒙） |

## 环境要求

- Node.js 18+

## 快速开始

```bash
# 根目录安装全部依赖
npm install

# 终端 1：启动服务端
npm run dev:apisrv

# 终端 2：启动管理后台 → http://localhost:5174
npm run dev:admin

# 终端 3：启动客户端 H5 → 默认代理到 localhost:3000
npm run dev:client
```

## 默认账号

| 用途 | 账号 | 密码 | 说明 |
|------|------|------|------|
| 管理后台 | admin | admin123 | 仅 admin 角色可登录后台 |
| 客户端 | demo | demo123 | 普通用户，也可自助注册 |

## 目录结构

```
apisrv/          # Express 服务端
admin/           # Vue 3 + Vite 管理后台
client/          # Uni-app 多端客户端
docs/            # 共享文档
```

## 客户端说明

客户端相关脚本与文档见 [`client/README.md`](client/README.md)。

切换 Mock：编辑 `client/.env.development` 中的 `VITE_USE_MOCK`。

## 部署

Jenkins + 1Panel 自动构建部署 API 见 [`docs/DEPLOY.md`](docs/DEPLOY.md)。

## API 概览

- `GET /` — 服务信息
- `GET /health` — 健康检查
- `POST /api/v1/auth/login` — 登录
- `POST /api/v1/auth/register` — 注册
- `GET /api/v1/home` — 客户端首页数据（需登录）
- `GET /api/v1/home/admin` — 管理后台首页（需 admin）
