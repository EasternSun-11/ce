import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearAuthStorage,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from '@/utils/storage'

const store = new Map<string, string>()

beforeEach(() => {
  store.clear()
  vi.stubGlobal('uni', {
    getStorageSync: (key: string) => store.get(key) ?? '',
    setStorageSync: (key: string, value: string) => {
      store.set(key, value)
    },
    removeStorageSync: (key: string) => {
      store.delete(key)
    },
  })
})

describe('auth storage', () => {
  it('persists and reads token', () => {
    setToken('abc-token')
    expect(getToken()).toBe('abc-token')
  })

  it('persists and reads user json', () => {
    setStoredUser({ id: '1', account: 'demo', nickname: 'Demo' })
    expect(getStoredUser()).toEqual({
      id: '1',
      account: 'demo',
      nickname: 'Demo',
    })
  })

  it('clears token and user', () => {
    setToken('t')
    setStoredUser({ id: '1', account: 'a' })
    clearAuthStorage()
    expect(getToken()).toBe('')
    expect(getStoredUser()).toBeNull()
  })
})
