import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const root = path.resolve(import.meta.dirname, '../..')
const checks = []

function ok(name, detail) {
  checks.push({ ok: true, name, detail })
}

function fail(name, detail) {
  checks.push({ ok: false, name, detail })
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel))
}

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}

// manifest
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, 'src/manifest.json'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''),
)
if (manifest.appid) ok('DCloud AppID', manifest.appid)
else fail('DCloud AppID', 'src/manifest.json 中 appid 为空')

const pkg = manifest['app-plus']?.distribute?.android?.packagename
if (pkg) ok('Android 包名', pkg)
else fail('Android 包名', 'manifest.json → app-plus.distribute.android.packagename 未配置')

// keystore
const keystore = path.join(root, 'android-offline/keystore/ui-app-release.keystore')
if (fs.existsSync(keystore)) ok('签名证书', 'android-offline/keystore/ui-app-release.keystore')
else fail('签名证书', '运行 scripts/android-offline/setup-keystore.ps1 生成')

// offline SDK
const sdkCandidates = [
  'android-offline/HBuilder-Integrate-AS',
  'android-offline/Android-SDK/HBuilder-Integrate-AS',
]
const sdkPath = sdkCandidates.find((rel) => exists(rel))
if (sdkPath) ok('离线 SDK 工程', sdkPath)
else {
  fail(
    '离线 SDK 工程',
    '下载 HBuilderX 5.07 对应 Android 离线 SDK，解压后将 HBuilder-Integrate-AS 放到 android-offline/',
  )
}

// HBuilderX resources
const resourcesDir = path.join(root, 'unpackage/resources')
let resourceApp = null
if (fs.existsSync(resourcesDir)) {
  const apps = fs.readdirSync(resourcesDir).filter((name) => name.startsWith('__UNI__'))
  if (apps.length) {
    resourceApp = apps[0]
    ok('本地打包资源', `unpackage/resources/${resourceApp}`)
  } else fail('本地打包资源', 'unpackage/resources 下无 __UNI__ 目录')
} else {
  fail(
    '本地打包资源',
    'HBuilderX → 发行 → 原生 App-本地打包 → 生成本地打包 App 资源',
  )
}

// adb / sdk
try {
  const adb = run('adb devices')
  ok('ADB', adb.split('\n').slice(1).filter(Boolean).join('; ') || '无设备')
} catch {
  fail('ADB', '未安装或未加入 PATH')
}

try {
  const hxVersion = fs.readFileSync('D:/HBuilderX/plugins/launcher/base/version.txt', 'utf8')
  ok('HBuilderX 版本', hxVersion.match(/hbuilderx_version=.+/g)?.join(', ') ?? '未知')
} catch {
  fail('HBuilderX 版本', '未在 D:/HBuilderX 找到，请确认安装路径')
}

console.log('\n=== Android 离线打包环境检查 ===\n')
for (const item of checks) {
  console.log(`${item.ok ? '✓' : '✗'} ${item.name}`)
  console.log(`  ${item.detail}\n`)
}

const ready = checks.every((item) => item.ok)
if (!ready) {
  console.log('尚未就绪。按 ✗ 项补齐后再执行 sync-resources.ps1 与 build-release.ps1')
  process.exit(1)
}

console.log('环境就绪，可执行:')
console.log('  pwsh scripts/android-offline/sync-resources.ps1')
console.log('  pwsh scripts/android-offline/build-release.ps1')
