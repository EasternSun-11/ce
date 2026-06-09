import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthResult, LoginParams, RegisterParams } from '@/api/auth'
import { login as loginAccount, register as registerAccount } from '@/api/auth'
import {
  markAuthJustReady,
  persistAuthSession,
} from '@/utils/auth-session'
import {
  getToken,
  getStoredUser,
  clearAuthStorage,
  type StoredUser,
} from '@/utils/storage'
import { platformLog } from '@/utils/platform'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken())
  const userInfo = ref<StoredUser | null>(getStoredUser())

  const isLoggedIn = computed(() => !!token.value)

  async function applyAuthResult(result: AuthResult) {
    await persistAuthSession(result)
    markAuthJustReady()
    token.value = result.token
    userInfo.value = result.user
    platformLog('auth', 'logged in', result.user.account)
  }

  async function login(params: LoginParams) {
    const result = await loginAccount(params)
    await applyAuthResult(result)
    return result
  }

  async function register(params: RegisterParams) {
    const result = await registerAccount(params)
    await applyAuthResult(result)
    return result
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    clearAuthStorage()
    uni.reLaunch({ url: '/pages/login/login' })
  }

  function hydrateFromStorage() {
    token.value = getToken()
    userInfo.value = getStoredUser()
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    register,
    logout,
    hydrateFromStorage,
  }
})
