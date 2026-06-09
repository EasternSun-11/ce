# Uni-app 多端登录注册 — 设计规格

**日期**：2026-06-04  
**状态**：已实现（与代码库同步）

## 目标

在标准 Uni-app（Vue 3 + Vite + TypeScript）上实现简单登录/注册，支持 H5、微信小程序、Android、鸿蒙的调试与打包文档化检索。

## 架构

- **页面**：`login`（启动页）→ `register` → `index`（登录后首页）
- **状态**：Pinia `user` store + `uni.setStorageSync` 持久化 token/user
- **API**：`api/request.ts` 封装 `uni.request`；`api/auth.ts` 定义 login/register
- **Mock**：`VITE_USE_MOCK=true` 时走 `mock/auth.ts`（300ms 延迟）
- **平台**：`utils/platform.ts` 提供条件编译友好的平台判断与日志前缀

## 范围

**包含**：账号+密码表单、校验、Mock/真实 API 切换、四端 DEBUG/BUILD 文档。

**不包含**：OAuth、短信验证码、图形验证码、uni-app x。

## 多端约束

- 鸿蒙使用 `APP-HARMONY`，禁止 `plus.*`
- 微信小程序需配置 `manifest.json` 中 `mp-weixin.appid`
- App/鸿蒙打包依赖 HBuilderX 4.27+

## 环境变量

| 变量 | 说明 |
|------|------|
| `VITE_API_BASE_URL` | 后端 API 根路径 |
| `VITE_USE_MOCK` | `true` 使用 Mock |

## 文件索引

见项目根 [README.md](../../README.md) 与 [docs/DEBUG.md](../DEBUG.md)。
