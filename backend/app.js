import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import { config } from './src/config/env.js'
import { logger } from './src/lib/logger.js'
import { errorHandler, notFoundHandler } from './src/middlewares/errorHandler.js'
import { requestLogger } from './src/middlewares/requestLogger.js'
import { authRouter } from './src/routes/auth.routes.js'
import { userRouter } from './src/routes/user.routes.js'
import { applicationRouter } from './src/routes/application.routes.js'
import { companyRouter } from './src/routes/company.routes.js'
import { interviewRouter } from './src/routes/interview.routes.js'
import { dsaRouter } from './src/routes/dsa.routes.js'
import { goalRouter } from './src/routes/goal.routes.js'
import { achievementRouter } from './src/routes/achievement.routes.js'
import { profileRouter } from './src/routes/profile.routes.js'
import { plannerRouter } from './src/routes/planner.routes.js'
import { notificationRouter } from './src/routes/notification.routes.js'
import { analyticsRouter } from './src/routes/analytics.routes.js'
import { dashboardRouter } from './src/routes/dashboard.routes.js'
import { settingsRouter } from './src/routes/settings.routes.js'
import { waitlistRouter } from './src/routes/waitlist.routes.js'

const app = express()

app.use(helmet())
app.use(compression())
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use(requestLogger)

const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
})
app.use(limiter)

app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim()),
  },
}))

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'OK',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  })
})

app.get('/readiness', (_req, res) => {
  const dbState = mongoose.connection.readyState
  res.json({
    success: true,
    message: 'Ready',
    data: {
      database: dbState === 1 ? 'connected' : 'disconnected',
      status: dbState === 1 ? 'ready' : 'not ready',
    },
  })
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/applications', applicationRouter)
app.use('/api/v1/companies', companyRouter)
app.use('/api/v1/interviews', interviewRouter)
app.use('/api/v1/dsa', dsaRouter)
app.use('/api/v1/goals', goalRouter)
app.use('/api/v1/achievements', achievementRouter)
app.use('/api/v1/profile', profileRouter)
app.use('/api/v1/planner', plannerRouter)
app.use('/api/v1/notifications', notificationRouter)
app.use('/api/v1/analytics', analyticsRouter)
app.use('/api/v1/dashboard', dashboardRouter)
app.use('/api/v1/settings', settingsRouter)
app.use('/api/v1/waitlist', waitlistRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app