import { Router } from 'express'
import { getProfile, updateProfile, updateNotificationPreferences, updateTheme, updateOnboarding } from '../controllers/user.controller.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()

router.use(authenticate)

router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.put('/notifications', updateNotificationPreferences)
router.put('/theme', updateTheme)
router.put('/onboarding', updateOnboarding)

export { router as userRouter }