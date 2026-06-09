import { afterEach, describe, expect, it } from 'vitest'
import {
  getPlatformKind,
  isAppHarmony,
  isAppPlus,
  isH5,
  isMpWeixin,
} from '@/utils/platform'

const originalPlatform = process.env.UNI_PLATFORM

afterEach(() => {
  if (originalPlatform === undefined) {
    delete process.env.UNI_PLATFORM
  } else {
    process.env.UNI_PLATFORM = originalPlatform
  }
})

describe('getPlatformKind', () => {
  it('returns h5 for H5 builds', () => {
    process.env.UNI_PLATFORM = 'h5'
    expect(getPlatformKind()).toBe('h5')
    expect(isH5()).toBe(true)
    expect(isMpWeixin()).toBe(false)
  })

  it('returns mp-weixin for WeChat mini program', () => {
    process.env.UNI_PLATFORM = 'mp-weixin'
    expect(getPlatformKind()).toBe('mp-weixin')
    expect(isMpWeixin()).toBe(true)
  })

  it('returns app-harmony for Harmony app', () => {
    process.env.UNI_PLATFORM = 'app-harmony'
    expect(getPlatformKind()).toBe('app-harmony')
    expect(isAppHarmony()).toBe(true)
    expect(isAppPlus()).toBe(false)
  })

  it('returns app-plus for native app shell', () => {
    process.env.UNI_PLATFORM = 'app-plus'
    expect(getPlatformKind()).toBe('app-plus')
    expect(isAppPlus()).toBe(true)
  })
})
