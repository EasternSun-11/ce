import { Router } from 'express'
import { listUsers } from '../data/users.js'
import type { AuthedRequest } from '../middleware/auth.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, (req: AuthedRequest, res) => {
  res.json({
    code: 0,
    data: {
      greeting: `你好，${req.authUser?.nickname || req.authUser?.username}`,
      role: req.authUser?.role,
      stats: {
        platforms: ['H5', '微信小程序', 'Android', '鸿蒙'],
        onlineUsers: 1,
      },
      quickLinks: [
        { id: 'profile', label: '个人资料', desc: '查看账号详情' },
        { id: 'security', label: '账号安全', desc: '密码与登录保护' },
      ],
    },
  })
})

router.get('/admin', requireAdmin, (_req, res) => {
  res.json({
    code: 0,
    data: {
      title: '管理后台首页',
      summary: {
        userCount: listUsers().length,
        todayLogins: 12,
        pendingTasks: 3,
      },
      users: listUsers(),
    },
  })
})

export default router
