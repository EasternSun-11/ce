import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockLogin, mockRegister } from '@/mock/auth'

function uniqueAccount(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

describe('mockRegister', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns token and user for new account', async () => {
    const account = uniqueAccount('reg')
    const promise = mockRegister({
      account,
      password: 'secret12',
      nickname: 'Tester',
    })
    await vi.advanceTimersByTimeAsync(300)
    const result = await promise

    expect(result.token).toContain(`mock-token-${account}`)
    expect(result.user.account).toBe(account)
    expect(result.user.nickname).toBe('Tester')
  })

  it('rejects duplicate registration', async () => {
    const account = uniqueAccount('dup')
    const first = mockRegister({ account, password: 'secret12' })
    await vi.advanceTimersByTimeAsync(300)
    await first

    const second = mockRegister({ account, password: 'other12' })
    const assertDuplicate = expect(second).rejects.toMatchObject({
      code: 409,
      message: '该账号已注册',
    })
    await vi.advanceTimersByTimeAsync(300)
    await assertDuplicate
  })
})

describe('mockLogin', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('logs in after registration', async () => {
    const account = uniqueAccount('login')
    const password = 'secret12'
    const reg = mockRegister({ account, password })
    await vi.advanceTimersByTimeAsync(300)
    await reg

    const loginPromise = mockLogin({ account, password })
    await vi.advanceTimersByTimeAsync(300)
    const result = await loginPromise

    expect(result.user.account).toBe(account)
    expect(result.token).toContain('mock-token')
  })

  it('rejects wrong password', async () => {
    const account = uniqueAccount('wrong')
    const reg = mockRegister({ account, password: 'secret12' })
    await vi.advanceTimersByTimeAsync(300)
    await reg

    const loginPromise = mockLogin({ account, password: 'badpass' })
    const assertFail = expect(loginPromise).rejects.toMatchObject({
      code: 401,
      message: '账号或密码错误',
    })
    await vi.advanceTimersByTimeAsync(300)
    await assertFail
  })
})
