import { defineStore } from 'pinia'
import type { AuthUser } from '@/api/auth'
import { fetchMe, login as apiLogin } from '@/api/auth'
import type { RequestError } from '@/api/request'

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: readStoredUser() as AuthUser | null,
  }),
  actions: {
    persist(authToken: string, authUser: AuthUser) {
      this.token = authToken
      this.user = authUser
      localStorage.setItem(TOKEN_KEY, authToken)
      localStorage.setItem(USER_KEY, JSON.stringify(authUser))
    },
    async login(username: string, password: string) {
      const result = await apiLogin(username, password)
      if (result.user.role !== 'admin') {
        const err: RequestError = { code: 403, message: '该账号无管理后台权限' }
        throw err
      }
      this.persist(result.access_token, result.user)
    },
    async hydrate() {
      if (!this.token) return
      try {
        this.user = await fetchMe()
        localStorage.setItem(USER_KEY, JSON.stringify(this.user))
      } catch {
        this.logout()
      }
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
  },
})
