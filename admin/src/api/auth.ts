import { request } from './request'

export interface AuthUser {
  id: string
  username: string
  nickname: string
  role: 'admin' | 'user'
}

export interface LoginResult {
  access_token: string
  user: AuthUser
}

export async function login(username: string, password: string): Promise<LoginResult> {
  return request<LoginResult>('/api/v1/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ username, password }),
  })
}

export interface AdminHomeData {
  title: string
  summary: {
    userCount: number
    todayLogins: number
    pendingTasks: number
  }
  users: AuthUser[]
}

export async function fetchAdminHome(): Promise<AdminHomeData> {
  return request<AdminHomeData>('/api/v1/home/admin')
}

export async function fetchMe(): Promise<AuthUser> {
  return request<AuthUser>('/api/v1/auth/me')
}
