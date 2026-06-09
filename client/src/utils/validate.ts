const ACCOUNT_MIN = 3
const ACCOUNT_MAX = 32
const PASSWORD_MIN = 6
const PASSWORD_MAX = 32

export function validateAccount(account: string): string | null {
  const v = account.trim()
  if (!v) return '请输入账号或手机号'
  if (v.length < ACCOUNT_MIN || v.length > ACCOUNT_MAX) {
    return `账号长度为 ${ACCOUNT_MIN}-${ACCOUNT_MAX} 位`
  }
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return '请输入密码'
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return `密码长度为 ${PASSWORD_MIN}-${PASSWORD_MAX} 位`
  }
  return null
}

export function validateConfirmPassword(
  password: string,
  confirm: string
): string | null {
  if (!confirm) return '请再次输入密码'
  if (password !== confirm) return '两次密码不一致'
  return null
}
