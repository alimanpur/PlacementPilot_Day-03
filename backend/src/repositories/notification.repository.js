import { Notification } from '../models/notification.model.js'
import { safeArray } from '../lib/safeData.js'

export class NotificationRepository {
  async create(userId, data) {
    return Notification.create({ ...data, userId })
  }

  async findById(userId, id) {
    return Notification.findOne({ _id: id, userId, deletedAt: null })
  }

  async findAll(userId) {
    return safeArray(await Notification.find({ userId, deletedAt: null }).sort({ createdAt: -1 }))
  }

  async findUnread(userId) {
    return safeArray(await Notification.find({ userId, read: false, deletedAt: null }).sort({ createdAt: -1 }))
  }

  async markRead(userId, id) {
    return Notification.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { read: true, readAt: new Date() },
      { new: true },
    )
  }

  async markAllRead(userId) {
    return Notification.updateMany(
      { userId, read: false, deletedAt: null },
      { read: true, readAt: new Date() },
    )
  }

  async delete(userId, id) {
    return Notification.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    )
  }

  async findRecent(userId, limit = 10) {
    return safeArray(await Notification.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(limit))
  }
}
