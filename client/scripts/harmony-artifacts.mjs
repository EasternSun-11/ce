import fs from 'fs'
import path from 'path'

/** uni-app CLI `dist/build/app-harmony` 运行时产物（非 DevEco 工程根） */
export const APP_HARMONY_CLI_ARTIFACTS = [
  'dist/build/app-harmony/manifest.json',
  'dist/build/app-harmony/app-service.js',
  'dist/build/app-harmony/app-config.js',
  'dist/build/app-harmony/__uniappview.html',
  'dist/build/app-harmony/pages/login/login.css',
  'dist/build/app-harmony/pages/register/register.css',
  'dist/build/app-harmony/pages/index/index.css',
  'dist/build/app-harmony/uni_modules/build-profile.json5',
]

/** HBuilderX 生成、可在 DevEco 打开的 OpenHarmony 工程根目录标记 */
export const OPENHARMONY_PROJECT_MARKERS = [
  'entry',
  'AppScope',
  'build-profile.json5',
]

export function isOpenHarmonyProjectDir(dir) {
  if (!dir || !fs.existsSync(dir)) return false
  return OPENHARMONY_PROJECT_MARKERS.every((name) =>
    fs.existsSync(path.join(dir, name))
  )
}

export function missingArtifacts(root, relPaths) {
  return relPaths.filter((rel) => !fs.existsSync(path.join(root, rel)))
}
