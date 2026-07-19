import winston from 'winston'
import { config } from '../config/env.js'

const { combine, timestamp, errors, json, printf, colorize } = winston.format

const devFormat = printf(({ level, message, timestamp, context, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : ''
  return `${timestamp} [${level}] ${context ? `[${context}]` : ''}: ${message} ${metaStr}`
})

export const logger = winston.createLogger({
  level: config.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    config.NODE_ENV === 'development' ? combine(colorize(), devFormat) : json(),
  ),
  defaultMeta: { service: 'placementpilot-backend' },
  transports: [
    new winston.transports.Console(),
    ...(config.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
          }),
        ]
      : []),
  ],
})

export const httpLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    json(),
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/http.log',
    }),
  ],
})

export const securityLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    json(),
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/security.log',
    }),
  ],
})

export const authLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    json(),
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/auth.log',
    }),
  ],
})