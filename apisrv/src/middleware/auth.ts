import type { Request, Response, NextFunction } from 'express'
import { findUser } from '../data/users.js'

export interface AuthedRequest extends Request {
  authUser?: {
    id: string
    username: string
    nickname: string
    role: 'admin' | 'user'
  }
}

function parseToken(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = parseToken(req.headers.authorization)
  if (!token?.startsWith('token-')) {
    res.status(401).json({ code: 401, message: '未登录或 token 无效' })
    return
  }
  const username = token.slice('token-'.length)
  const user = findUser(username)
  if (!user) {
    res.status(401).json({ code: 401, message: '登录已过期，请重新登录' })
    return
  }
  req.authUser = {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    role: user.role,
  }
  next()
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.authUser?.role !== 'admin') {
      res.status(403).json({ code: 403, message: '需要管理员权限' })
      return
    }
    next()
  })
}
