export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

export interface RequestError {
  code: number
  message: string
}

interface ApiEnvelope<T> {
  code?: number
  message?: string
  data?: T
}

async function parseJson<T>(res: Response): Promise<T> {
  const body = (await res.json()) as ApiEnvelope<T> | T
  if (body && typeof body === 'object' && 'code' in body) {
    const envelope = body as ApiEnvelope<T>
    if (envelope.code === 0 && envelope.data != null) {
      return envelope.data
    }
    throw { code: envelope.code ?? -1, message: envelope.message || '请求失败' }
  }
  return body as T
}

export async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, ...init } = options
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (auth) {
    const token = localStorage.getItem('admin_token')
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }
  const url = path.startsWith('http')
    ? path
    : `${apiBaseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, { ...init, headers })
  if (res.status === 401) {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    throw { code: 401, message: '登录已过期，请重新登录' }
  }
  if (!res.ok) {
    try {
      await parseJson<never>(res)
    } catch (e) {
      throw e
    }
    throw { code: res.status, message: `请求失败 (${res.status})` }
  }
  return parseJson<T>(res)
}
