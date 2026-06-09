export const TOKEN_KEY = 'auth_token'
export const USER_KEY = 'auth_user'

export function getToken(): string {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

export function setToken(token: string): void {
  uni.setStorageSync(TOKEN_KEY, token)
}

export function removeToken(): void {
  uni.removeStorageSync(TOKEN_KEY)
}

export interface StoredUser {
  id: string
  account: string
  nickname?: string
}

export function getStoredUser(): StoredUser | null {
  const raw = uni.getStorageSync(USER_KEY)
  if (!raw) return null
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {
    return null
  }
}

export function setStoredUser(user: StoredUser): void {
  // 微信小程序可直接存对象；H5 等端也兼容
  uni.setStorageSync(USER_KEY, user)
}

export function removeStoredUser(): void {
  uni.removeStorageSync(USER_KEY)
}

export function clearAuthStorage(): void {
  removeToken()
  removeStoredUser()
}
