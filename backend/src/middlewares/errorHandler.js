import { logger } from '../lib/logger.js'

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
    data: null,
  })
}

export const errorHandler = (err, req, res, _next) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    context: 'error',
    path: req.path,
    method: req.method,
  })

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'
  const code = err.code || null
  const isProd = process.env.NODE_ENV === 'production'

  res.status(statusCode).json({
    success: false,
    message,
    code,
    data: null,
    ...(isProd ? {} : { stack: err.stack }),
  })
}

export const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}