import { UserRepository } from '../repositories/user.repository.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'

const userRepo = new UserRepository()

export const getProfile = asyncWrapper(async (req, res) => {
  const user = await userRepo.findById(req.user._id)
  res.json({
    success: true,
    message: 'Profile retrieved',
    data: { user },
  })
})

export const updateProfile = asyncWrapper(async (req, res) => {
  const user = await userRepo.update(req.user._id, req.body)
  res.json({
    success: true,
    message: 'Profile updated',
    data: { user },
  })
})

export const updateNotificationPreferences = asyncWrapper(async (req, res) => {
  const user = await userRepo.update(req.user._id, {
    notificationPreferences: req.body,
  })
  res.json({
    success: true,
    message: 'Notification preferences updated',
    data: { user },
  })
})

export const updateTheme = asyncWrapper(async (req, res) => {
  const user = await userRepo.update(req.user._id, {
    theme: req.body.theme,
  })
  res.json({
    success: true,
    message: 'Theme updated',
    data: { user },
  })
})

export const updateOnboarding = asyncWrapper(async (req, res) => {
  const user = await userRepo.update(req.user._id, {
    onboarding: { ...req.user.onboarding, ...req.body },
  })
  res.json({
    success: true,
    message: 'Onboarding updated',
    data: { user },
  })
})

export const deleteAccount = asyncWrapper(async (req, res) => {
  await userRepo.updateRefreshToken(req.user._id, null, null)
  await userRepo.delete(req.user._id)
  res
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .json({
      success: true,
      message: 'Account scheduled for deletion',
      data: null,
    })
})