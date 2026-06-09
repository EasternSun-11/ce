# 四端调试速查

## 环境要求

- Node.js 18+
- npm 或 pnpm
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)（小程序）
- [HBuilderX 4.27+](https://www.dcloud.io/hbuilderx.html)（Android / 鸿蒙 App）
- [DevEco Studio](https://developer.huawei.com/consumer/cn/deveco-studio/)（鸿蒙，API 12+）

## 建议调试顺序

H5（UI/逻辑）→ 微信小程序（storage/跳转）→ Android App → 鸿蒙 App

---

## H5

| 项 | 说明 |
|----|------|
| 命令 | `npm run dev:h5` |
| 访问 | 终端输出的本地 URL（通常带端口） |
| 日志 | 浏览器 DevTools + 终端；前缀 `[h5]` |
| Mock | 默认开启，见 `.env.development` 中 `VITE_USE_MOCK=true` |
| 自动化测试 | `npm run test:h5`（见 [TESTING.md](./TESTING.md)） |

## 微信小程序

`dist` 下 **不会同时存在** `dev` 和 `build`，目录取决于你执行的命令：

| 模式 | 命令 | 微信开发者工具导入目录 | 环境 |
|------|------|------------------------|------|
| **开发**（推荐日常调试） | `npm run dev:mp-weixin` | **`dist/dev/mp-weixin`** | `.env.development`，默认 Mock |
| **生产构建**（上传/真机预览） | `npm run build:mp-weixin` | **`dist/build/mp-weixin`** | `.env.production`，连 `test.cancan.asia` |

若 `dist` 里**只有 `build` 没有 `dev`**，说明只跑过 `build`，没跑过 `dev`。可以：

- 继续用现有包：导入 **`F:\ui-app\dist\build\mp-weixin`**
- 或需要 Mock / 热更新：先执行 `npm run dev:mp-weixin`，等终端出现 `DONE` 后再导入 **`dist/dev/mp-weixin`**

| 项 | 说明 |
|----|------|
| AppID | 在 `src/manifest.json` → `mp-weixin.appid` 填写测试号 |
| 域名校验 | 开发阶段：详情 → 本地设置 → 勾选「不校验合法域名…」；正式发布须在公众平台配置 `test.cancan.asia` |
| 网络异常 / 登录跳回 | 开发用 `dev` 包 + Mock；`build` 包需真实账号，改代码后需重新 `build` 再导入 |
| `webapi_getwxaasyncsecinfo:fail` | 多为开发者工具/AppID 告警，一般可忽略；在 `manifest.json` 填测试 AppID 可减轻 |
| `POST .../login 401` | **不是**「闪回登录页」的根因时，看响应：`login failed` = 账号密码错；测试服默认 **`admin` / `admin123`**（密码至少 6 位） |
| 日志 | 微信开发者工具控制台；前缀 `[mp-weixin]` |

## Android App

| 项 | 说明 |
|----|------|
| 工具 | HBuilderX |
| 操作 | **运行 → 运行到手机或模拟器 → Android** |
| 工程目录 | `unpackage/dist/dev/app-plus` |
| 日志 | HBuilderX 控制台 |
| 注意 | 使用 `uni.*`，勿在鸿蒙专用逻辑里混用 `plus.*` |

## 鸿蒙 App

| 项 | 说明 |
|----|------|
| 工具 | HBuilderX 4.27+、DevEco Studio（API 19+ 模拟器建议 API 20+） |
| 操作 | **HBuilderX → 运行 → 运行到鸿蒙**（不要只用 CLI 后手动开 DevEco） |
| DevEco 打开目录 | **`unpackage/dist/dev/app-harmony`**（调试）或 **`unpackage/dist/build/app-harmony`**（发行） |
| 签名 | 模拟器通常免签名；真机配置 `harmony-configs/build-profile.json5` |
| 注意 | 仅 `APP-HARMONY` / `APP` 条件编译命中鸿蒙，见 [PLATFORM.md](./PLATFORM.md) |

### 常见错误：打不开 `dist/build/app-harmony`

`npm run build:app-harmony` 生成的是 **`dist/build/app-harmony`**，里面只有 `app-service.js`、`pages/` 等 **uni 编译产物**，**不是** DevEco 可识别的 OpenHarmony 工程（缺少 `entry/`、`AppScope/`、`build-profile.json5` 等）。

DevEco 提示 *Select an OpenHarmony or HarmonyOS project* 说明目录选错了。请：

1. 用 **HBuilderX** 打开项目根目录 `F:\ui-app`
2. 工具 → 设置 → 运行配置 → 填写 **DevEco Studio 安装路径**
3. 菜单 **运行 → 运行到鸿蒙**，由 HX 生成 **`unpackage/dist/dev/app-harmony`**
4. 在 DevEco 中 **File → Open** 打开上一步目录（或由 HX 自动拉起）

---

## 代码定位索引

| 需求 | 路径 |
|------|------|
| 登录/注册 API | `src/api/auth.ts` |
| 请求封装 / 401 | `src/api/request.ts` |
| Mock 数据 | `src/mock/auth.ts` |
| 用户状态 | `src/stores/user.ts` |
| Token 存储 | `src/utils/storage.ts` |
| 环境变量 | `.env.development` / `src/config/env.ts` |
| 路由页面 | `src/pages.json` |

---

## 常见问题

**H5 接口跨域**  
开发环境可在 `vite.config.ts` 配置 `server.proxy`，或将 `VITE_USE_MOCK=true` 使用 Mock。

**小程序登录后白屏**  
确认 `pages.json` 中已注册 `pages/index/index`，且 `reLaunch` 路径以 `/` 开头。

**鸿蒙运行失败**  
检查 HBuilderX、DevEco 版本；删除 `unpackage` 与 `harmony-configs` 后由 HX 重新生成（注意备份自定义签名配置）。
