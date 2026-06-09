import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { isOpenHarmonyProjectDir } from './harmony-artifacts.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const candidates = [
  path.join(root, 'dist/dev/app-harmony'),
  path.join(root, 'unpackage/dist/dev/app-harmony'),
  path.join(root, 'dist/build/app-harmony'),
  path.join(root, 'unpackage/dist/build/app-harmony'),
]

const found = candidates.filter((dir) => fs.existsSync(dir))
const devecoReady = found.filter((dir) => isOpenHarmonyProjectDir(dir))

if (devecoReady.length > 0) {
  console.log('[deveco] OpenHarmony project OK:')
  devecoReady.forEach((dir) => console.log(`  - ${path.relative(root, dir)}`))
  process.exit(0)
}

console.error('[deveco] No DevEco-openable Harmony project found.')
if (found.length > 0) {
  console.error('  Directories exist but missing entry/ AppScope/ build-profile.json5:')
  found.forEach((dir) => console.error(`  - ${path.relative(root, dir)}`))
} else {
  console.error('  Expected (after HBuilderX 运行到鸿蒙):')
  candidates.forEach((dir) => console.error(`  - ${path.relative(root, dir)}`))
}
console.error('')
console.error('CLI build (npm run build:app-harmony) only creates dist/build/app-harmony.')
console.error('Use HBuilderX → 运行 → 运行到鸿蒙 to generate unpackage/dist/dev/app-harmony.')
process.exit(1)
