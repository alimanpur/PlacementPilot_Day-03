import { AuthService } from '../services/auth.service.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'

const authService = new AuthService()

export const register = asyncWrapper(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body)

  res
    .status(201)
    .cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      message: 'Account created successfully',
      data: { user, accessToken, refreshToken },
    })
})

export const login = asyncWrapper(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(
    req.body.email,
    req.body.password,
  )

  res
    .cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      message: 'Login successful',
      data: { user, accessToken, refreshToken },
    })
})

export const forgotPassword = asyncWrapper(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email)
  res.json({
    success: true,
    message: result.message,
    data: null,
  })
})

export const resetPassword = asyncWrapper(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password)
  res.json({
    success: true,
    message: 'Password updated successfully',
    data: null,
  })
})

export const refresh = asyncWrapper(async (req, res) => {
  const inputRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  const { accessToken, refreshToken } = await authService.refresh(
    inputRefreshToken,
  )

  res
    .cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken, refreshToken },
    })
})

export const logout = asyncWrapper(async (req, res) => {
  await authService.logout(req.user._id)
  res
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .json({
      success: true,
      message: 'Logged out successfully',
      data: null,
    })
})