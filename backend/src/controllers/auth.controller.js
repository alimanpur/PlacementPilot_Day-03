import { AuthService } from '../services/auth.service.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'

const authService = new AuthService()

// Cross-origin credentialed cookies (Vercel frontend -> Render backend) must use
// SameSite=None with the Secure flag. In development (no HTTPS) the browser
// rejects SameSite=None, so we fall back to Lax (localhost is same-site).
const isProd = process.env.NODE_ENV === 'production'
const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge,
  path: '/',
})

export const register = asyncWrapper(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body)

  res
    .status(201)
    .cookie('accessToken', accessToken, cookieOptions(15 * 60 * 1000))
    .cookie('refreshToken', refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000))
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

  // CRITICAL AUTH FIX: Clear any stale cookies first to prevent old refresh
  // tokens from being used after switching accounts on the same browser.
  res
    .clearCookie('accessToken', { path: '/' })
    .clearCookie('refreshToken', { path: '/' })
    .cookie('accessToken', accessToken, cookieOptions(15 * 60 * 1000))
    .cookie('refreshToken', refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000))
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
  // SECURITY FIX: The refresh token exchange must validate that the token
  // belongs to the session making the request. We extract from body first
  // when explicitly provided, falling back to the cookie (which is overwritten
  // on every login so stale tokens cannot substitute another user).
  const inputRefreshToken = req.body.refreshToken || req.cookies.refreshToken
  const { accessToken, refreshToken } = await authService.refresh(
    inputRefreshToken,
  )

  res
    .cookie('accessToken', accessToken, cookieOptions(15 * 60 * 1000))
    .cookie('refreshToken', refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000))
    .json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken, refreshToken },
    })
})

export const logout = asyncWrapper(async (req, res) => {
  await authService.logout(req.user._id)
  res
    .clearCookie('accessToken', { path: '/' })
    .clearCookie('refreshToken', { path: '/' })
    .json({
      success: true,
      message: 'Logged out successfully',
      data: null,
    })
})