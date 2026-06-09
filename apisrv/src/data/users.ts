export interface UserRecord {
  id: string
  username: string
  password: string
  nickname: string
  role: 'admin' | 'user'
}

/** 内存用户表，重启后恢复默认账号 */
const users = new Map<string, UserRecord>([
  [
    'admin',
    {
      id: 'u-admin',
      username: 'admin',
      password: 'admin123',
      nickname: '管理员',
      role: 'admin',
    },
  ],
  [
    'demo',
    {
      id: 'u-demo',
      username: 'demo',
      password: 'demo123',
      nickname: '演示用户',
      role: 'user',
    },
  ],
])

export function findUser(username: string): UserRecord | undefined {
  return users.get(username.trim())
}

export function createUser(
  username: string,
  password: string,
  nickname?: string
): UserRecord {
  const name = username.trim()
  if (users.has(name)) {
    throw new Error('USER_EXISTS')
  }
  const user: UserRecord = {
    id: `u-${name}`,
    username: name,
    password,
    nickname: nickname || name,
    role: 'user',
  }
  users.set(name, user)
  return user
}

export function listUsers(): Omit<UserRecord, 'password'>[] {
  return Array.from(users.values()).map(({ password: _, ...rest }) => rest)
}
