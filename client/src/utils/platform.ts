export type PlatformKind =
  | 'h5'
  | 'mp-weixin'
  | 'app-plus'
  | 'app-harmony'
  | 'other'

/** 构建时注入的平台标识，见 uni-app 文档 UNI_PLATFORM */
function getUniPlatform(): string {
  return process.env.UNI_PLATFORM || 'other'
}

export function getPlatformKind(): PlatformKind {
  const p = getUniPlatform()
  if (p === 'h5') return 'h5'
  if (p === 'mp-weixin') return 'mp-weixin'
  if (p === 'app-harmony') return 'app-harmony'
  if (p === 'app-plus' || p === 'app') return 'app-plus'
  return 'other'
}

export function isH5(): boolean {
  return getPlatformKind() === 'h5'
}

export function isMpWeixin(): boolean {
  return getPlatformKind() === 'mp-weixin'
}

export function isAppHarmony(): boolean {
  return getPlatformKind() === 'app-harmony'
}

export function isAppPlus(): boolean {
  return getPlatformKind() === 'app-plus'
}

/** 控制台日志前缀，便于四端对照 */
export function platformLog(tag: string, ...args: unknown[]): void {
  const prefix = `[${getPlatformKind()}] ${tag}`
  console.log(prefix, ...args)
}
