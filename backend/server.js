import http from 'http'
import mongoose from 'mongoose'
import app from './app.js'
import { logger } from './src/lib/logger.js'
import { config } from './src/config/env.js'

const server = http.createServer(app)

const MONGODB_CONNECT_TIMEOUT = 10000

const startServer = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: MONGODB_CONNECT_TIMEOUT,
      connectTimeoutMS: MONGODB_CONNECT_TIMEOUT,
    })
    logger.info('MongoDB connected successfully', { service: 'placementpilot-backend' })
  } catch (error) {
    logger.error('Failed to connect to MongoDB', {
      service: 'placementpilot-backend',
      error: error.message,
    })
    logger.warn('Starting server without database connection. Some routes will be unavailable.', {
      service: 'placementpilot-backend',
    })
  }

  server.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`, {
      service: 'placementpilot-backend',
      env: config.NODE_ENV,
    })
  })
}

const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal} — shutting down`, { service: 'placementpilot-backend' })
  server.close(() => {
    mongoose.connection.close(false).then(() => {
      logger.info('MongoDB connection closed', { service: 'placementpilot-backend' })
      process.exit(0)
    })
  })

  setTimeout(() => {
    logger.error('Forced shutdown after timeout', { service: 'placementpilot-backend' })
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

server.on('error', (error) => {
  logger.error('HTTP server error', { service: 'placementpilot-backend', error: error.message })
})

startServer()
