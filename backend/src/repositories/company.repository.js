import mongoose from 'mongoose'
import { Company } from '../models/company.model.js'
import { Application } from '../models/application.model.js'
import { Interview } from '../models/interview.model.js'

export class CompanyRepository {
  async create(userId, data) {
    return Company.create({ ...data, userId })
  }

  async findById(userId, id) {
    return Company.findOne({ _id: id, userId, deletedAt: null })
  }

  async findByIdOrCode(userId, id) {
    return Company.findOne({
      $or: [
        { _id: id.length === 24 ? id : { $exists: false } },
        { name: new RegExp(`^${id}$`, 'i') },
      ],
      userId,
      deletedAt: null,
    })
  }

  async findAll(userId, _filters = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      search = '',
      industry,
      hiringStatus,
      favorite,
      priority,
      archived,
      tags,
    } = options

    const query = { userId, deletedAt: null }

    // Apply filters
    if (industry) query.industry = industry
    if (hiringStatus) query.hiringStatus = hiringStatus
    if (favorite !== undefined) query.favorite = favorite
    if (priority) query.priority = priority
    if (archived !== undefined) query.archived = archived
    if (tags && tags.length > 0) query.tags = { $in: tags }

    // Search
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { industry: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') },
        { notes: new RegExp(search, 'i') },
      ]
    }

    const skip = (page - 1) * limit

    const [companies, total] = await Promise.all([
      Company.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(query),
    ])

    return {
      companies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async update(userId, id, data) {
    return Company.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      data,
      { new: true, runValidators: true },
    )
  }

  async delete(userId, id) {
    return Company.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    )
  }

  async archive(userId, id, archived = true) {
    return Company.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { archived },
      { new: true },
    )
  }

  async restore(userId, id) {
    return Company.findOneAndUpdate(
      { _id: id, userId, deletedAt: { $ne: null } },
      { deletedAt: null, archived: false },
      { new: true },
    )
  }

  async toggleFavorite(userId, id) {
    const company = await Company.findOne({ _id: id, userId, deletedAt: null })
    if (!company) return null
    return Company.findByIdAndUpdate(id, { favorite: !company.favorite }, { new: true })
  }

  async addNote(userId, id, note) {
    return Company.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $push: { notes: { content: note, createdAt: new Date() } } },
      { new: true },
    )
  }

  async addTimeline(userId, id, timeline) {
    return Company.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $push: { timeline: { ...timeline, timestamp: new Date() } } },
      { new: true },
    )
  }

  async addAttachment(userId, id, attachment) {
    return Company.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $push: { attachments: { ...attachment, uploadedAt: new Date() } } },
      { new: true },
    )
  }

  async removeAttachment(userId, id, attachmentUrl) {
    return Company.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $pull: { attachments: { url: attachmentUrl } } },
      { new: true },
    )
  }

  async countByStatus(userId) {
    return Company.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      { $group: { _id: '$hiringStatus', count: { $sum: 1 } } },
    ])
  }

  async countByIndustry(userId) {
    return Company.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null, industry: { $ne: null } } },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
  }

  async findRecent(userId, limit = 10) {
    return Company.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  async findFavorites(userId) {
    return Company.find({ userId, favorite: true, deletedAt: null })
      .sort({ updatedAt: -1 })
      .lean()
  }

  async getStats(userId) {
    const [statusCounts, industryCounts, total] = await Promise.all([
      this.countByStatus(userId),
      this.countByIndustry(userId),
      Company.countDocuments({ userId, deletedAt: null }),
    ])

    return {
      total,
      statusCounts,
      industryCounts,
    }
  }

  async updateStats(userId, companyId) {
    const [applications, interviews] = await Promise.all([
      Application.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), company: new mongoose.Types.ObjectId(companyId), deletedAt: null } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            wishlist: { $sum: { $cond: [{ $eq: ['$currentStage', 'wishlist'] }, 1, 0] } },
            applied: { $sum: { $cond: [{ $eq: ['$currentStage', 'applied'] }, 1, 0] } },
            onlineAssessment: { $sum: { $cond: [{ $eq: ['$currentStage', 'online_assessment'] }, 1, 0] } },
            interviews: { $sum: { $cond: [{ $in: ['$currentStage', ['technical_interview', 'managerial_interview', 'hr_interview']] }, 1, 0] } },
            offers: { $sum: { $cond: [{ $eq: ['$currentStage', 'offer'] }, 1, 0] } },
            accepted: { $sum: { $cond: [{ $eq: ['$currentStage', 'accepted'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$currentStage', 'rejected'] }, 1, 0] } },
            withdrawn: { $sum: { $cond: [{ $eq: ['$currentStage', 'withdrawn'] }, 1, 0] } },
            avgCtc: { $avg: '$package' },
            maxCtc: { $max: '$package' },
          },
        },
      ]),
      Interview.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), companyId: new mongoose.Types.ObjectId(companyId), deletedAt: null } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            cleared: { $sum: { $cond: [{ $eq: ['$status', 'cleared'] }, 1, 0] } },
          },
        },
      ]),
    ])

    const appStats = applications[0] || {}

    const stats = {
      applications: appStats.total || 0,
      wishlist: appStats.wishlist || 0,
      applied: appStats.applied || 0,
      onlineAssessment: appStats.onlineAssessment || 0,
      interviews: appStats.interviews || 0,
      offers: appStats.offers || 0,
      accepted: appStats.accepted || 0,
      rejected: appStats.rejected || 0,
      withdrawn: appStats.withdrawn || 0,
      successRate: appStats.total > 0 ? Math.round((appStats.accepted / appStats.total) * 100) : 0,
      offerRate: appStats.total > 0 ? Math.round((appStats.offers / appStats.total) * 100) : 0,
      interviewRate: appStats.applied > 0 ? Math.round((appStats.interviews / appStats.applied) * 100) : 0,
      responseRate: 0,
      averageResponseTime: 0,
      averageCtc: appStats.avgCtc || 0,
      highestCtc: appStats.maxCtc || 0,
    }

    return Company.findByIdAndUpdate(companyId, { stats }, { new: true })
  }
}