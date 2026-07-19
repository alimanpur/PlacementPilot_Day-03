import mongoose from 'mongoose'
import { Application } from '../models/application.model.js'

export class ApplicationRepository {
  async create(userId, data) {
    return Application.create({ ...data, userId })
  }

  async findById(userId, id) {
    return Application.findOne({ _id: id, userId, deletedAt: null })
  }

  async findAll(userId, filters = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      ...restFilters
    } = options

    const query = { userId, deletedAt: null, ...restFilters }

    // Global search
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { recruiterName: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ]
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 }

    const skip = (page - 1) * limit

    const [applications, total] = await Promise.all([
      Application.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Application.countDocuments(query),
    ])

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async update(userId, id, data) {
    return Application.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      data,
      { new: true, runValidators: true },
    )
  }

  async delete(userId, id) {
    return Application.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    )
  }

  async archive(userId, id, archived = true) {
    return Application.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { archived },
      { new: true },
    )
  }

  async restore(userId, id) {
    return Application.findOneAndUpdate(
      { _id: id, userId, deletedAt: { $ne: null } },
      { deletedAt: null, archived: false },
      { new: true },
    )
  }

  async duplicate(userId, id) {
    const original = await this.findById(userId, id)
    if (!original) return null

    const { _id, ...rest } = original.toObject()
    const duplicate = await Application.create({
      ...rest,
      company: `${original.company} (Copy)`,
      currentStage: 'wishlist',
      status: 'active',
      timeline: [],
      appliedDate: undefined,
    })

    return duplicate
  }

  async bulkUpdate(userId, ids, data) {
    return Application.updateMany(
      { _id: { $in: ids }, userId, deletedAt: null },
      { $set: data },
    )
  }

  async bulkDelete(userId, ids) {
    return Application.updateMany(
      { _id: { $in: ids }, userId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
    )
  }

  async bulkArchive(userId, ids, archived = true) {
    return Application.updateMany(
      { _id: { $in: ids }, userId, deletedAt: null },
      { $set: { archived } },
    )
  }

  async addTimelineEntry(userId, id, entry) {
    return Application.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $push: { timeline: { ...entry, timestamp: new Date() } } },
      { new: true },
    )
  }

  async addAttachment(userId, id, attachment) {
    return Application.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $push: { attachments: { ...attachment, uploadedAt: new Date() } } },
      { new: true },
    )
  }

  async removeAttachment(userId, id, attachmentUrl) {
    return Application.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $pull: { attachments: { url: attachmentUrl } } },
      { new: true },
    )
  }

  async countByStatus(userId) {
    return Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])
  }

  async countByStage(userId) {
    return Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      { $group: { _id: '$currentStage', count: { $sum: 1 } } },
    ])
  }

  async countByPriority(userId) {
    return Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ])
  }

  async getMonthlyTrends(userId, months = 12) {
    const data = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const [applied, offers, rejected] = await Promise.all([
        Application.countDocuments({
          userId,
          appliedDate: { $gte: monthStart, $lt: monthEnd },
          deletedAt: null,
        }),
        Application.countDocuments({
          userId,
          currentStage: 'accepted',
          appliedDate: { $gte: monthStart, $lt: monthEnd },
          deletedAt: null,
        }),
        Application.countDocuments({
          userId,
          currentStage: 'rejected',
          appliedDate: { $gte: monthStart, $lt: monthEnd },
          deletedAt: null,
        }),
      ])

      data.push({
        month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        applied,
        offers,
        rejected,
      })
    }

    return data
  }

  async getUpcomingDeadlines(userId, limit = 10) {
    const now = new Date()
    return Application.find({
      userId,
      deletedAt: null,
      archived: false,
      deadline: { $gte: now, $ne: null },
      currentStage: { $nin: ['accepted', 'rejected', 'withdrawn'] },
    })
      .sort({ deadline: 1 })
      .limit(limit)
      .lean()
  }

  async getRecentApplications(userId, limit = 10) {
    return Application.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  async getPipelineSummary(userId) {
    const stages = [
      'wishlist',
      'ready_to_apply',
      'applied',
      'online_assessment',
      'technical_interview',
      'managerial_interview',
      'hr_interview',
      'offer',
    ]

    const summary = await Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      {
        $group: {
          _id: '$currentStage',
          count: { $sum: 1 },
        },
      },
    ])

    const stageMap = {}
    stages.forEach((stage) => {
      stageMap[stage] = 0
    })

    summary.forEach((item) => {
      if (stageMap.hasOwnProperty(item._id)) {
        stageMap[item._id] = item.count
      }
    })

    return stageMap
  }

  async getApplicationStats(userId) {
    const stats = await Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          wishlist: { $sum: { $cond: [{ $eq: ['$currentStage', 'wishlist'] }, 1, 0] } },
          applied: { $sum: { $cond: [{ $eq: ['$currentStage', 'applied'] }, 1, 0] } },
          interviews: { $sum: { $cond: [{ $in: ['$currentStage', ['technical_interview', 'managerial_interview', 'hr_interview']] }, 1, 0] } },
          offers: { $sum: { $cond: [{ $eq: ['$currentStage', 'offer'] }, 1, 0] } },
          accepted: { $sum: { $cond: [{ $eq: ['$currentStage', 'accepted'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$currentStage', 'rejected'] }, 1, 0] } },
        },
      },
    ])

    return stats[0] || {
      total: 0,
      wishlist: 0,
      applied: 0,
      interviews: 0,
      offers: 0,
      accepted: 0,
      rejected: 0,
    }
  }
}