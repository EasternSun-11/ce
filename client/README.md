# ui-app Client — Uni-app 多端登录注册

Vue 3 + Vite + TypeScript 的 Uni-app 示例：登录、注册，可在 **H5**、**微信小程序**、**Android**、**鸿蒙** 上调试与打包。

## 环境要求

- Node.js 18+
- npm（或 pnpm）
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- [HBuilderX 4.27+](https://www.dcloud.io/hbuilderx.html)（Android / 鸿蒙）
- [DevEco Studio](https://developer.huawei.com/consumer/cn/deveco-studio/)（鸿蒙）

## 快速开始

在**仓库根目录**执行：

```bash
npm install
npm run dev:client          # H5
npm run dev:client:weixin   # 微信小程序 → 导入 dist/dev/mp-weixin
```

或在 `client/` 目录下：

```bash
npm run dev:h5
npm run dev:mp-weixin
```

默认连接本地 `apisrv`（`http://localhost:3000`）。切换 Mock：编辑 `.env.development`，设置 `VITE_USE_MOCK=true`。

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev:h5` | H5 开发 |
| `npm run dev:mp-weixin` | 微信小程序开发 |
| `npm run build:h5` | H5 构建 |
| `npm run build:mp-weixin` | 微信小程序构建 |
| `npm run type-check` | TypeScript 检查 |

## 目录结构

```
src/
├── api/           # request、auth
├── mock/          # Mock 认证
├── stores/        # Pinia user
├── config/        # 环境变量
├── utils/         # storage、platform、validate
└── pages/         # login、register、index
```

## 测试

```bash
npm run test:h5
npm run test:platforms
```

详见 [../docs/TESTING.md](../docs/TESTING.md)。

## 文档

- [测试指南](../docs/TESTING.md)
- [调试指南](../docs/DEBUG.md)
- [打包指南](../docs/BUILD.md)
- [多端差异](../docs/PLATFORM.md)

## 微信小程序 AppID

在 [`src/manifest.json`](src/manifest.json) 的 `mp-weixin.appid` 填入你的测试或正式 AppID。

## Android / 鸿蒙

使用 HBuilderX 打开 `client/` 目录，参见 [../docs/DEBUG.md](../docs/DEBUG.md)。
