import { NotificationRepository } from '../repositories/notification.repository.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'

const notificationRepo = new NotificationRepository()

export const getAllNotifications = asyncWrapper(async (req, res) => {
  const notifications = await notificationRepo.findAll(req.user._id)
  res.json({
    success: true,
    message: 'Notifications retrieved',
    data: { notifications },
  })
})

export const markRead = asyncWrapper(async (req, res) => {
  const notification = await notificationRepo.markRead(req.user._id, req.params.id)
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found',
      data: null,
    })
  }
  res.json({
    success: true,
    message: 'Notification marked as read',
    data: { notification },
  })
})

export const markAllRead = asyncWrapper(async (req, res) => {
  await notificationRepo.markAllRead(req.user._id)
  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: null,
  })
})