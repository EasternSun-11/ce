# 多端差异与条件编译

## 平台标识（`utils/platform.ts`）

| 编译宏 | 运行时 `getPlatformKind()` | 说明 |
|--------|---------------------------|------|
| `H5` | `h5` | 浏览器 |
| `MP-WEIXIN` | `mp-weixin` | 微信小程序 |
| `APP-PLUS` | `app-plus` | Android / iOS 原生壳 |
| `APP-HARMONY` | `app-harmony` | 鸿蒙 App |

## 鸿蒙（APP-HARMONY）约束

1. **不要使用 `plus.*` API**（属于 APP-PLUS，鸿蒙不兼容）。
2. 条件编译请用 `#ifdef APP-HARMONY`，不要用 `APP-PLUS` 冒充鸿蒙逻辑。
3. 存储、网络、跳转统一使用 `uni.*`（本项目已遵循）。
4. 运行与打包见 [DEBUG.md](./DEBUG.md)、[BUILD.md](./BUILD.md)。

## 示例：按平台写代码

```vue
<!-- #ifdef APP-HARMONY -->
<!-- 仅鸿蒙 -->
<!-- #endif -->

<!-- #ifdef APP-PLUS -->
<!-- 仅 Android/iOS App -->
<!-- #endif -->
```

## 日志对照

各端控制台日志带前缀，例如 `[h5] auth`、`[mp-weixin] request`，便于四端并行调试时区分来源。
