# 测试指南（TDD + 多端）

## 分层

| 层级 | 命令 | 说明 |
|------|------|------|
| 单元测试 | `npm run test:unit` | 校验、Mock 认证、storage、platform（Vitest） |
| H5 | `npm run test:h5` | 单元测试 + H5 构建 + 产物检查 |
| 微信小程序 | `npm run test:mp-weixin` | 构建 + 产物检查 |
| Android 壳 | `npm run test:app` | `uni build -p app` + 产物检查 |
| 鸿蒙壳 | `npm run test:app-harmony` | 单元测试 + `uni build -p app-harmony` + CLI 产物检查 |
| 鸿蒙 DevEco 工程 | `npm run verify:deveco:harmony` | 检查 `unpackage/dist/*/app-harmony`（需 HBuilderX 生成） |
| 全部依次 | `npm run test:platforms` | 按 H5 → 微信 → App → 鸿蒙 顺序执行 |

## H5 手动验证

```bash
npm run dev:h5
```

浏览器打开终端中的本地地址，在注册/登录页走一遍流程（默认 Mock，见 `.env.development`）。

## TDD 新增逻辑时

1. 在 `tests/` 增加失败用例
2. `npm run test:unit` 确认红灯
3. 实现 `src/` 中最少代码
4. 再次运行至绿灯

## 真机

CLI 测试覆盖**编译产物**；Android / 鸿蒙**真机运行**仍需 HBuilderX，见 [DEBUG.md](./DEBUG.md)。
