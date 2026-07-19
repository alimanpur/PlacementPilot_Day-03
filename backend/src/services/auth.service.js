import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'
import { config } from '../config/env.js'
import { UserRepository } from '../repositories/user.repository.js'
import { sendEmail } from './email.service.js'
import { authLogger } from '../lib/logger.js'

const userRepo = new UserRepository()

export class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      { userId: user._id, email: user.email },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN },
    )
  }

  generateRefreshToken() {
    const token = uuidv4()
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)
    return { token, expires }
  }

  async register(data) {
    const existingUser = await userRepo.findByEmail(data.email)
    if (existingUser) {
      const error = new Error('User already exists')
      error.statusCode = 409
      error.code = 'USER_ALREADY_EXISTS'
      throw error
    }

    const user = await userRepo.create({
      ...data,
    })

    const accessToken = this.generateAccessToken(user)
    const { token: refreshToken, expires } = this.generateRefreshToken()
    await userRepo.updateRefreshToken(user._id, refreshToken, expires)

    authLogger.info('User registered', { userId: user._id, email: user.email })
    return { user, accessToken, refreshToken }
  }

  async login(email, password) {
    const user = await userRepo.findByEmail(email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValid = await user.comparePassword(password)
    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    const accessToken = this.generateAccessToken(user)
    const { token: refreshToken, expires } = this.generateRefreshToken()

    await userRepo.updateRefreshToken(user._id, refreshToken, expires)

    authLogger.info('User logged in', { userId: user._id, email: user.email })
    return { user, accessToken, refreshToken }
  }

  async forgotPassword(email) {
    const user = await userRepo.findByEmail(email)
    if (!user) {
      return { message: 'If email exists, reset link sent' }
    }

    const resetToken = uuidv4()
    const resetExpires = new Date()
    resetExpires.setHours(resetExpires.getHours() + 1)

    await userRepo.setResetToken(user.email, resetToken, resetExpires)

    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      template: 'reset',
      data: { name: user.name, token: resetToken },
    })

    authLogger.info('Password reset requested', { userId: user._id, email: user.email })
    return { message: 'If email exists, reset link sent' }
  }

  async resetPassword(token, password) {
    const user = await userRepo.findByResetToken(token)
    if (!user) {
      throw new Error('Invalid or expired reset token')
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    await userRepo.updatePassword(user._id, hashedPassword)

    authLogger.info('Password reset successful', { userId: user._id, email: user.email })
    return user
  }

  async refresh(refreshToken) {
    const user = await userRepo.findByRefreshToken(refreshToken)
    if (!user || user.refreshToken !== refreshToken) {
      const error = new Error('Invalid refresh token')
      error.statusCode = 401
      error.code = 'REFRESH_TOKEN_INVALID'
      throw error
    }

    if (user.refreshTokenExpires < new Date()) {
      const error = new Error('Refresh token expired')
      error.statusCode = 401
      error.code = 'REFRESH_TOKEN_EXPIRED'
      throw error
    }

    const accessToken = this.generateAccessToken(user)
    const { token: newRefreshToken, expires } = this.generateRefreshToken()

    await userRepo.updateRefreshToken(user._id, newRefreshToken, expires)

    return { accessToken, refreshToken: newRefreshToken }
  }

  async logout(userId) {
    await userRepo.updateRefreshToken(userId, null, null)
    authLogger.info('User logged out', { userId })
  }
}