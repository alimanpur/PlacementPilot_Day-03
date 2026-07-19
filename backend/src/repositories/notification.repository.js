import { Notification } from '../models/notification.model.js'

export class NotificationRepository {
  async create(userId, data) {
    return Notification.create({ ...data, userId })
  }

  async findById(userId, id) {
    return Notification.findOne({ _id: id, userId, deletedAt: null })
  }

  async findAll(userId) {
    return Notification.find({ userId, deletedAt: null }).sort({ createdAt: -1 })
  }

  async findUnread(userId) {
    return Notification.find({ userId, read: false, deletedAt: null }).sort({ createdAt: -1 })
  }

  async markRead(userId, id) {
    return Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true, readAt: new Date() },
      { new: true },
    )
  }

  async markAllRead(userId) {
    return Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() },
    )
  }

  async delete(userId, id) {
    return Notification.findByIdAndUpdate(id, { deletedAt: new Date() })
  }

  async findRecent(userId, limit = 10) {
    return Notification.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(limit)
  }
}
