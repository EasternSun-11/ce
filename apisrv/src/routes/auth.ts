import { Router } from 'express'
import { createUser, findUser } from '../data/users.js'
import type { AuthedRequest } from '../middleware/auth.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

function issueToken(username: string) {
  return `token-${username}`
}

router.post('/login', (req, res) => {
  const username = String(req.body?.username || '').trim()
  const password = String(req.body?.password || '')
  if (!username || !password) {
    res.status(400).json({ code: 400, message: '请输入账号和密码' })
    return
  }
  const user = findUser(username)
  if (!user || user.password !== password) {
    res.status(401).json({ code: 401, message: '账号或密码错误' })
    return
  }
  res.json({
    code: 0,
    data: {
      access_token: issueToken(user.username),
      expires_in: 86400,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
      },
    },
  })
})

router.post('/register', (req, res) => {
  const username = String(req.body?.username || '').trim()
  const password = String(req.body?.password || '')
  const nickname = String(req.body?.nickname || '').trim()
  if (!username || !password) {
    res.status(400).json({ code: 400, message: '请输入账号和密码' })
    return
  }
  try {
    const user = createUser(username, password, nickname || undefined)
    res.status(201).json({
      code: 0,
      data: {
        access_token: issueToken(user.username),
        expires_in: 86400,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          role: user.role,
        },
      },
    })
  } catch {
    res.status(409).json({ code: 409, message: '该账号已注册' })
  }
})

router.get('/me', requireAuth, (req: AuthedRequest, res) => {
  res.json({ code: 0, data: req.authUser })
})

export default router
