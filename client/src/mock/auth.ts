import type { AuthResult, LoginParams, RegisterParams } from '@/api/auth'

const MOCK_DELAY_MS = 300

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_DELAY_MS)
  })
}

const mockUsers = new Map<string, { password: string; nickname: string }>()

export async function mockLogin(params: LoginParams): Promise<AuthResult> {
  const account = params.account.trim()
  const user = mockUsers.get(account)
  if (!user || user.password !== params.password) {
    throw { code: 401, message: '账号或密码错误' }
  }
  return delay({
    token: `mock-token-${account}-${Date.now()}`,
    user: {
      id: `u-${account}`,
      account,
      nickname: user.nickname,
    },
  })
}

export async function mockRegister(params: RegisterParams): Promise<AuthResult> {
  const account = params.account.trim()
  if (mockUsers.has(account)) {
    throw { code: 409, message: '该账号已注册' }
  }
  mockUsers.set(account, {
    password: params.password,
    nickname: params.nickname || account,
  })
  return delay({
    token: `mock-token-${account}-${Date.now()}`,
    user: {
      id: `u-${account}`,
      account,
      nickname: params.nickname || account,
    },
  })
}
