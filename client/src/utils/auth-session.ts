import type { StoredUser } from '@/utils/storage'
import { getToken, TOKEN_KEY, USER_KEY } from '@/utils/storage'

const AUTH_READY_KEY = 'authJustReady'

interface AppInstance {
  globalData?: Record<string, unknown>
}

function getAppInstance(): AppInstance {
  return getApp() as AppInstance
}

/** 登录成功后标记，避免微信小程序 reLaunch 后首页读不到 storage 又跳回登录 */
export function markAuthJustReady(): void {
  const app = getAppInstance()
  if (!app.globalData) app.globalData = {}
  app.globalData[AUTH_READY_KEY] = true
}

export function consumeAuthJustReady(): boolean {
  const app = getAppInstance()
  if (app.globalData?.[AUTH_READY_KEY]) {
    app.globalData[AUTH_READY_KEY] = false
    return true
  }
  return false
}

export function persistAuthSession(result: {
  token: string
  user: StoredUser
}): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.setStorage({
      key: TOKEN_KEY,
      data: result.token,
      success: () => {
        uni.setStorage({
          key: USER_KEY,
          data: result.user,
          success: () => {
            if (!getToken()) {
              reject({ code: -1, message: '登录状态保存失败，请重试' })
              return
            }
            resolve()
          },
          fail: (err) =>
            reject({ code: -1, message: err.errMsg || '用户信息保存失败' }),
        })
      },
      fail: (err) =>
        reject({ code: -1, message: err.errMsg || '登录状态保存失败' }),
    })
  })
}
