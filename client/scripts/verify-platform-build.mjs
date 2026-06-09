import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { APP_HARMONY_CLI_ARTIFACTS, missingArtifacts } from './harmony-artifacts.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const checks = {
  h5: ['dist/build/h5/index.html', 'dist/build/h5/assets/pages-login-login'],
  'mp-weixin': [
    'dist/build/mp-weixin/app.json',
    'dist/build/mp-weixin/pages/login/login.wxml',
    'dist/build/mp-weixin/pages/register/register.wxml',
  ],
  app: ['dist/build/app/manifest.json'],
  'app-harmony': APP_HARMONY_CLI_ARTIFACTS,
}

function exists(rel) {
  if (rel.endsWith('pages-login-login')) {
    const dir = path.join(root, 'dist/build/h5/assets')
    if (!fs.existsSync(dir)) return false
    return fs.readdirSync(dir).some((f) => f.includes('pages-login-login'))
  }
  return fs.existsSync(path.join(root, rel))
}

const platform = process.argv[2]
if (!platform || !checks[platform]) {
  console.error(
    `Usage: node scripts/verify-platform-build.mjs <${Object.keys(checks).join('|')}>`
  )
  process.exit(1)
}

const missing =
  platform === 'app-harmony'
    ? missingArtifacts(root, checks[platform])
    : checks[platform].filter((rel) => !exists(rel))
if (missing.length) {
  console.error(`[${platform}] Missing build artifacts:`)
  missing.forEach((m) => console.error(`  - ${m}`))
  process.exit(1)
}

console.log(`[${platform}] Build artifacts OK`)
