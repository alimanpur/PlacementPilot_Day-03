import mongoose from 'mongoose'
import { Resource } from '../models/resource.model.js'

export class ResourceRepository {
  async create(userId, data) {
    return Resource.create({ ...data, userId })
  }

  async findById(userId, id) {
    return Resource.findOne({ _id: id, userId, deletedAt: null })
  }

  async findByCompany(userId, companyId, filters = {}) {
    const query = { userId, companyId, deletedAt: null }

    if (filters.type) query.type = filters.type
    if (filters.round) query.round = filters.round
    if (filters.difficulty) query.difficulty = filters.difficulty
    if (filters.year) query.year = filters.year
    if (filters.search) {
      query.$or = [
        { title: new RegExp(filters.search, 'i') },
        { description: new RegExp(filters.search, 'i') },
        { content: new RegExp(filters.search, 'i') },
        { tags: new RegExp(filters.search, 'i') },
      ]
    }

    return Resource.find(query)
      .sort(filters.sort || '-createdAt')
      .lean()
  }

  async findAll(userId, filters = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      type,
      companyId,
    } = options

    const query = { userId, deletedAt: null }

    if (type) query.type = type
    if (companyId) query.companyId = companyId
    if (filters.search) {
      query.$or = [
        { title: new RegExp(filters.search, 'i') },
        { description: new RegExp(filters.search, 'i') },
        { tags: new RegExp(filters.search, 'i') },
      ]
    }

    const skip = (page - 1) * limit

    const [resources, total] = await Promise.all([
      Resource.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Resource.countDocuments(query),
    ])

    return {
      resources,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async update(userId, id, data) {
    return Resource.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      data,
      { new: true, runValidators: true },
    )
  }

  async delete(userId, id) {
    return Resource.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    )
  }

  async addAttachment(userId, id, attachment) {
    return Resource.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $push: { attachments: { ...attachment, uploadedAt: new Date() } } },
      { new: true },
    )
  }

  async removeAttachment(userId, id, attachmentUrl) {
    return Resource.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $pull: { attachments: { url: attachmentUrl } } },
      { new: true },
    )
  }

  async countByType(userId) {
    return Resource.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ])
  }
}