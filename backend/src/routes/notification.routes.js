import { Router } from 'express'
import {
  getAllNotifications,
  markRead,
  markAllRead,
} from '../controllers/notification.controller.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', getAllNotifications)
router.patch('/:id/read', markRead)
router.patch('/read-all', markAllRead)

export { router as notificationRouter }