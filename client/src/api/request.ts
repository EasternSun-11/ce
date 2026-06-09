import { apiBaseUrl } from '@/config/env'
import { getToken, clearAuthStorage } from '@/utils/storage'
import { platformLog } from '@/utils/platform'

export interface RequestError {
  code: number
  message: string
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
  url: string
  method?: HttpMethod
  data?: object
  /** 是否附带 Authorization，默认 true */
  auth?: boolean
}

function buildUrl(path: string): string {
  if (path.startsWith('http')) return path
  const base = apiBaseUrl.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

interface ApiEnvelope<T> {
  code?: number
  message?: string
  data?: T
}

function parseResponseBody<T>(raw: unknown): ApiEnvelope<T> | T {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as ApiEnvelope<T>
    } catch {
      return raw as T
    }
  }
  return raw as ApiEnvelope<T> | T
}

function isApiEnvelope<T>(body: unknown): body is ApiEnvelope<T> {
  return (
    !!body &&
    typeof body === 'object' &&
    'code' in body &&
    typeof (body as ApiEnvelope<T>).code === 'number'
  )
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (isApiEnvelope(body) && body.message) {
    return body.message
  }
  if (body && typeof body === 'object' && 'message' in body) {
    const msg = (body as { message?: string }).message
    if (msg) return msg
  }
  return fallback
}

function mapLoginErrorMessage(message: string): string {
  const normalized = message.toLowerCase()
  if (normalized === 'login failed' || normalized === 'wrong password') {
    return '账号或密码错误'
  }
  if (normalized.includes('unsupported relations')) {
    return '服务端登录异常（角色数据加载失败），请联系管理员'
  }
  return message
}

function toRequestError(err: unknown): RequestError {
  if (err && typeof err === 'object') {
    const e = err as {
      code?: number
      message?: string
      errMsg?: string
    }
    const msg = e.errMsg || e.message
    if (msg) {
      if (msg.includes('url not in domain list')) {
        return {
          code: -1,
          message: '请求域名未加入微信小程序合法域名，请在后台配置或开发阶段关闭域名校验',
        }
      }
      return { code: e.code ?? -1, message: msg }
    }
  }
  return { code: -1, message: '网络异常，请稍后重试' }
}

export function request<T>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, auth = true } = options
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (auth) {
    const token = getToken()
    if (token) header.Authorization = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: buildUrl(url),
      method,
      data,
      header,
      success: (res) => {
        const status = res.statusCode
        if (status === 401) {
          const body = parseResponseBody<unknown>(res.data)
          const serverMsg = extractErrorMessage(body, '登录已过期，请重新登录')
          if (auth) {
            clearAuthStorage()
            uni.reLaunch({ url: '/pages/login/login' })
            reject({ code: 401, message: serverMsg })
            return
          }
          reject({
            code: 401,
            message: mapLoginErrorMessage(serverMsg),
          })
          return
        }
        if (status >= 200 && status < 300) {
          const body = parseResponseBody<T>(res.data)
          if (isApiEnvelope(body)) {
            if (body.code === 0 && body.data != null) {
              resolve(body.data)
              return
            }
            reject({
              code: body.code ?? -1,
              message: body.message || '请求失败',
            })
            return
          }
          resolve(body as T)
          return
        }
        const msg =
          (res.data as { message?: string })?.message || `请求失败 (${status})`
        platformLog('request', url, status, msg)
        reject({ code: status, message: msg })
      },
      fail: (err) => {
        platformLog('request-fail', url, err)
        reject(toRequestError(err))
      },
    })
  })
}
