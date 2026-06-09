import { apiBaseUrl, useMock } from '@/config/env'
import { request } from '@/api/request'
import { mockLogin, mockRegister } from '@/mock/auth'

export interface LoginParams {
  account: string
  password: string
}

export interface RegisterParams {
  account: string
  password: string
  nickname?: string
}

export interface AuthUser {
  id: string
  account: string
  nickname?: string
}

export interface AuthResult {
  token: string
  user: AuthUser
}

/** 平台后端登录响应（test.cancan.asia / www.cancan.asia） */
interface PlatformLoginData {
  access_token: string
  refresh_token?: string
  expires_in?: number
}

function mapPlatformLogin(
  account: string,
  data: PlatformLoginData
): AuthResult {
  if (!data?.access_token) {
    throw { code: -1, message: '登录响应异常，未返回 token' }
  }
  return {
    token: data.access_token,
    user: {
      id: account,
      account,
      nickname: account,
    },
  }
}

export async function login(params: LoginParams): Promise<AuthResult> {
  if (useMock) {
    return mockLogin(params)
  }
  const account = params.account.trim()
  const data = await request<PlatformLoginData>({
    url: '/api/v1/auth/login',
    method: 'POST',
    data: { username: account, password: params.password },
    auth: false,
  })
  return mapPlatformLogin(account, data)
}

export async function register(params: RegisterParams): Promise<AuthResult> {
  if (useMock) {
    return mockRegister(params)
  }
  const account = params.account.trim()
  const data = await request<PlatformLoginData & { user?: AuthUser }>({
    url: '/api/v1/auth/register',
    method: 'POST',
    data: {
      username: account,
      password: params.password,
      nickname: params.nickname,
    },
    auth: false,
  })
  const result = mapPlatformLogin(account, data)
  if (data.user) {
    result.user = data.user
  }
  return result
}

/** 真实后端健康检查（Mock 模式下跳过） */
export async function pingApi(): Promise<void> {
  if (useMock || !apiBaseUrl) return
  await request<void>({ url: '/health', method: 'GET', auth: false })
}
