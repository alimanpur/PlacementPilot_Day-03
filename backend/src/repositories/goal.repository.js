import { Goal } from '../models/goal.model.js'

export class GoalRepository {
  async create(userId, data) {
    return Goal.create({ ...data, userId })
  }

  async findById(userId, id) {
    return Goal.findOne({ _id: id, userId, deletedAt: null })
  }

  async findAll(userId, filters = {}) {
    return Goal.find({ userId, deletedAt: null, ...filters }).sort({ deadline: 1 })
  }

  async findActive(userId) {
    return Goal.find({ userId, deletedAt: null, status: 'active' }).sort({ deadline: 1 })
  }

  async findCompleted(userId) {
    return Goal.find({ userId, deletedAt: null, status: 'completed' }).sort({ completedAt: -1 })
  }

  async update(userId, id, data) {
    return Goal.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      data,
      { new: true, runValidators: true },
    )
  }

  async delete(userId, id) {
    return Goal.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    )
  }

  async markComplete(userId, id) {
    return Goal.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { progress: 100, status: 'completed', completedAt: new Date() },
      { new: true },
    )
  }

  async findRecent(userId, limit = 10) {
    return Goal.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(limit)
  }

  async getGoalStats(userId) {
    const [total, active, completed, byCategory] = await Promise.all([
      Goal.countDocuments({ userId, deletedAt: null }),
      Goal.countDocuments({ userId, deletedAt: null, status: 'active' }),
      Goal.countDocuments({ userId, deletedAt: null, status: 'completed' }),
      Goal.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
        {
          $group: {
            _id: '$category',
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          },
        },
        { $sort: { total: -1 } },
      ]),
    ])

    return {
      total,
      active,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byCategory,
    }
  }
}
