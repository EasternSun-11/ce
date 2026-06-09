import { describe, expect, it } from 'vitest'
import {
  validateAccount,
  validateConfirmPassword,
  validatePassword,
} from '@/utils/validate'

describe('validateAccount', () => {
  it('rejects empty account', () => {
    expect(validateAccount('')).toBe('请输入账号或手机号')
    expect(validateAccount('   ')).toBe('请输入账号或手机号')
  })

  it('rejects account shorter than 3 characters', () => {
    expect(validateAccount('ab')).toBe('账号长度为 3-32 位')
  })

  it('accepts valid account', () => {
    expect(validateAccount('demo')).toBeNull()
    expect(validateAccount('  demo  ')).toBeNull()
  })
})

describe('validatePassword', () => {
  it('rejects empty password', () => {
    expect(validatePassword('')).toBe('请输入密码')
  })

  it('rejects password shorter than 6 characters', () => {
    expect(validatePassword('12345')).toBe('密码长度为 6-32 位')
  })

  it('accepts valid password', () => {
    expect(validatePassword('123456')).toBeNull()
  })
})

describe('validateConfirmPassword', () => {
  it('rejects empty confirm', () => {
    expect(validateConfirmPassword('123456', '')).toBe('请再次输入密码')
  })

  it('rejects mismatched passwords', () => {
    expect(validateConfirmPassword('123456', '654321')).toBe('两次密码不一致')
  })

  it('accepts matching passwords', () => {
    expect(validateConfirmPassword('123456', '123456')).toBeNull()
  })
})
