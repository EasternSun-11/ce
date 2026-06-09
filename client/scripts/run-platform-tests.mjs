import { spawnSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function run(label, args) {
  console.log(`\n========== ${label} ==========\n`)
  const result = spawnSync(npm, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  if (result.status !== 0) {
    console.error(`\n[FAIL] ${label} (exit ${result.status})`)
    process.exit(result.status ?? 1)
  }
  console.log(`\n[PASS] ${label}`)
}

// 1. H5: unit tests + build + artifact check
run('H5', ['run', 'test:h5'])

// 2. 微信小程序
run('mp-weixin build', ['run', 'build:mp-weixin'])
run('mp-weixin artifact verify', ['run', 'verify:build:mp-weixin'])

// 3. Android App 壳（CLI 编译产物，真机运行仍需 HBuilderX）
run('app (Android) build', ['run', 'build:app'])
run('app artifact verify', ['run', 'verify:build:app'])

// 4. 鸿蒙 App 壳
run('app-harmony build', ['run', 'build:app-harmony'])
run('app-harmony artifact verify', ['run', 'verify:build:app-harmony'])

console.log('\n========== All platform tests passed ==========\n')
