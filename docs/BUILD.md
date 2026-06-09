# 四端打包速查

## H5

```bash
npm run build:h5
```

| 项 | 值 |
|----|-----|
| 输出目录 | `dist/build/h5` |
| 部署 | 静态资源托管至任意 Web 服务器或 uniCloud 前端网页托管 |

## 微信小程序

```bash
npm run build:mp-weixin
```

| 项 | 值 |
|----|-----|
| 输出目录 | `dist/build/mp-weixin` |
| 上传 | 微信开发者工具 → 上传 → 微信公众平台提交审核 |

发布前请在 `src/manifest.json` 配置正式 `mp-weixin.appid`。

## Android App

| 项 | 说明 |
|----|------|
| 入口 | HBuilderX → **发行 → 原生 App-云打包** 或 **本地打包** |
| 产物 | 常见为 `unpackage/release/apk` 等（以 HX 提示为准） |
| 证书 | 云打包需在 DCloud 开发者中心配置 Android 签名证书 |

CLI 侧无官方一键 APK 命令，App 打包以 HBuilderX 为准。

## 鸿蒙 App

| 项 | 说明 |
|----|------|
| 入口 | HBuilderX → **发行 → App-Harmony-本地打包**（须先通过 HX 跑通过一次鸿蒙） |
| DevEco 可打开的工程 | `unpackage/dist/dev/app-harmony`（调试）、`unpackage/dist/build/app-harmony`（发行） |
| CLI 产物（勿用 DevEco 直接打开） | `dist/build/app-harmony` — 仅为 JS/CSS 资源，不是完整鸿蒙工程 |
| 产物 | `.hap` / `.app` 安装包（发布需 **release** 签名） |
| 签名 | `harmony-configs/build-profile.json5` → `app.signingConfigs`，`name` 为 `release` |

参考：[鸿蒙运行和发行](https://uniapp.dcloud.net.cn/tutorial/run/run-app-harmony.html)

---

## 环境切换（真实后端）

1. 修改 `.env.production` 中 `VITE_API_BASE_URL`
2. 设置 `VITE_USE_MOCK=false`
3. 确保后端 CORS（H5）与小程序 request 合法域名已配置

---

## .gitignore 说明

`dist/`、`unpackage/`、`node_modules/` 不纳入版本库；`harmony-configs/` 建议纳入 git 以便团队签名与包名一致。
