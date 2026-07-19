import mongoose from 'mongoose'
import { HiringInfo } from '../models/hiring-info.model.js'

export class HiringInfoRepository {
  async create(userId, data) {
    return HiringInfo.create({ ...data, userId })
  }

  async findById(userId, id) {
    return HiringInfo.findOne({ _id: id, userId, deletedAt: null })
  }

  async findByCompany(userId, companyId) {
    return HiringInfo.findOne({ userId, companyId, deletedAt: null })
  }

  async findAll(userId, filters = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      employmentType,
      recruitmentCycle,
    } = options

    const query = { userId, deletedAt: null }

    if (employmentType) query.employmentType = employmentType
    if (recruitmentCycle) query.recruitmentCycle = recruitmentCycle
    if (filters.search) {
      query.$or = [
        { selectionProcess: new RegExp(filters.search, 'i') },
        { techStack: new RegExp(filters.search, 'i') },
        { importantSkills: new RegExp(filters.search, 'i') },
      ]
    }

    const skip = (page - 1) * limit

    const [hiringInfos, total] = await Promise.all([
      HiringInfo.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      HiringInfo.countDocuments(query),
    ])

    return {
      hiringInfos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async update(userId, id, data) {
    return HiringInfo.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      data,
      { new: true, runValidators: true },
    )
  }

  async delete(userId, id) {
    return HiringInfo.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    )
  }

  async upsertByCompany(userId, companyId, data) {
    return HiringInfo.findOneAndUpdate(
      { userId, companyId },
      { ...data, userId, companyId },
      { new: true, runValidators: true, upsert: true },
    )
  }
}