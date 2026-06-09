import cors from 'cors'
import express from 'express'
import authRoutes from './routes/auth.js'
import homeRoutes from './routes/home.js'

const app = express()
const PORT = Number(process.env.PORT) || 3000

app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({
    name: 'ui-app apisrv',
    version: '0.0.0',
    endpoints: {
      health: 'GET /health',
      login: 'POST /api/v1/auth/login',
      register: 'POST /api/v1/auth/register',
      home: 'GET /api/v1/home',
      adminHome: 'GET /api/v1/home/admin',
    },
    demoAccounts: [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'demo', password: 'demo123', role: 'user' },
    ],
  })
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/home', homeRoutes)

app.listen(PORT, () => {
  console.log(`apisrv listening on http://localhost:${PORT}`)
})
