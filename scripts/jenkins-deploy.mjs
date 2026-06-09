#!/usr/bin/env node
/**
 * Jenkins 部署工作流：git pull → npm install → build → pm2 restart
 *
 * 环境变量：
 *   WORK_DIR        项目根目录（默认：本脚本上级目录）
 *   GIT_BRANCH      要拉取的分支（默认：保持当前分支，仅 git pull）
 *   SKIP_GIT_PULL   设为 1 跳过 git pull（Jenkins SCM 已检出时可用）
 *   SKIP_BUILD      设为 1 跳过 npm run build:apisrv
 *   PM2_APP         pm2 应用名，逗号分隔多个（默认：ui-app-apisrv）
 *   PM2_ECOSYSTEM   pm2 ecosystem 配置文件路径（相对 WORK_DIR，默认：ecosystem.config.cjs）
 */

import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(process.env.WORK_DIR ?? path.join(__dirname, '..'))
const isWin = process.platform === 'win32'

function command(name) {
  return isWin ? `${name}.cmd` : name
}

function runStep(label, cmd, args, options = {}) {
  console.log(`\n========== ${label} ==========\n`)
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: isWin,
    env: process.env,
    ...options,
  })

  if (result.error) {
    console.error(`\n[FAIL] ${label}: ${result.error.message}`)
    process.exit(1)
  }
  if (result.status !== 0) {
    console.error(`\n[FAIL] ${label} (exit ${result.status})`)
    process.exit(result.status ?? 1)
  }

  console.log(`\n[PASS] ${label}`)
}

function gitPull() {
  if (process.env.SKIP_GIT_PULL === '1') {
    console.log('\n[SKIP] git pull (SKIP_GIT_PULL=1)')
    return
  }

  const branch = process.env.GIT_BRANCH?.trim()
  if (branch) {
    runStep('git fetch', command('git'), ['fetch', 'origin', branch])
    runStep('git checkout', command('git'), [branch])
    runStep('git pull', command('git'), ['pull', '--ff-only', 'origin', branch])
    return
  }

  runStep('git pull', command('git'), ['pull', '--ff-only'])
}

function npmInstall() {
  runStep('npm install', command('npm'), ['install'])
}

function buildApisrv() {
  if (process.env.SKIP_BUILD === '1') {
    console.log('\n[SKIP] build (SKIP_BUILD=1)')
    return
  }

  runStep('build apisrv', command('npm'), ['run', 'build:apisrv'])
}

function pm2Restart() {
  const ecosystem = process.env.PM2_ECOSYSTEM ?? 'ecosystem.config.cjs'
  const ecosystemPath = path.resolve(root, ecosystem)

  if (!fs.existsSync(ecosystemPath)) {
    console.error(`\n[FAIL] pm2 ecosystem 文件不存在: ${ecosystemPath}`)
    process.exit(1)
  }

  const apps = (process.env.PM2_APP ?? 'ui-app-apisrv')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)

  for (const app of apps) {
    const list = spawnSync(command('pm2'), ['describe', app], {
      cwd: root,
      stdio: 'pipe',
      shell: isWin,
      encoding: 'utf8',
    })

    if (list.status !== 0) {
      console.log(`\n[INFO] pm2 应用 "${app}" 未运行，尝试首次启动...\n`)
      runStep(`pm2 start ${app}`, command('pm2'), ['start', ecosystemPath, '--only', app])
      continue
    }

    runStep(`pm2 restart ${app}`, command('pm2'), [
      'restart',
      app,
      '--update-env',
    ])
  }

  runStep('pm2 save', command('pm2'), ['save'])
}

console.log(`\n[Jenkins Deploy] 工作目录: ${root}`)
console.log(`[Jenkins Deploy] 平台: ${process.platform}\n`)

gitPull()
npmInstall()
buildApisrv()
pm2Restart()

console.log('\n========== Deploy finished ==========\n')
