import { Router } from 'express'
import { register, login, forgotPassword, resetPassword, refresh, logout } from '../controllers/auth.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, refreshTokenSchema } from '../validators/auth.validator.js'

const router = Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.post('/forgot', validate(forgotPasswordSchema), forgotPassword)
router.post('/reset', validate(resetPasswordSchema), resetPassword)
router.post('/refresh', validate(refreshTokenSchema), refresh)
router.post('/logout', authenticate, logout)

export { router as authRouter }