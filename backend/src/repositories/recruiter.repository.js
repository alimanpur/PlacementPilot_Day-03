import mongoose from 'mongoose'
import { Recruiter } from '../models/recruiter.model.js'

export class RecruiterRepository {
  async create(userId, data) {
    return Recruiter.create({ ...data, userId })
  }

  async findById(userId, id) {
    return Recruiter.findOne({ _id: id, userId, deletedAt: null })
  }

  async findByCompany(userId, companyId) {
    return Recruiter.find({ userId, companyId, deletedAt: null })
      .sort({ createdAt: -1 })
      .lean()
  }

  async findAll(userId, filters = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      companyId,
      relationshipStatus,
    } = options

    const query = { userId, deletedAt: null }

    if (companyId) query.companyId = companyId
    if (relationshipStatus) query.relationshipStatus = relationshipStatus
    if (filters.search) {
      query.$or = [
        { name: new RegExp(filters.search, 'i') },
        { email: new RegExp(filters.search, 'i') },
        { role: new RegExp(filters.search, 'i') },
      ]
    }

    const skip = (page - 1) * limit

    const [recruiters, total] = await Promise.all([
      Recruiter.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Recruiter.countDocuments(query),
    ])

    return {
      recruiters,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async update(userId, id, data) {
    return Recruiter.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      data,
      { new: true, runValidators: true },
    )
  }

  async delete(userId, id) {
    return Recruiter.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    )
  }

  async addTimeline(userId, id, timeline) {
    return Recruiter.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $push: { timeline: { ...timeline, timestamp: new Date() } } },
      { new: true },
    )
  }

  async findUpcomingFollowUps(userId, limit = 10) {
    return Recruiter.find({
      userId,
      deletedAt: null,
      nextFollowUp: { $gte: new Date() },
    })
      .sort({ nextFollowUp: 1 })
      .limit(limit)
      .lean()
  }
}