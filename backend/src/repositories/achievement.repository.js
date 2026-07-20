import { Achievement } from '../models/achievement.model.js'

export class AchievementRepository {
  async create(userId, data) {
    return Achievement.create({ ...data, userId })
  }

  async findById(userId, id) {
    return Achievement.findOne({ _id: id, userId, deletedAt: null })
  }

  async findAll(userId) {
    return Achievement.find({ userId, deletedAt: null }).sort({ unlockedAt: -1 })
  }

  async findByCategory(userId, category) {
    return Achievement.find({ userId, deletedAt: null, category }).sort({ unlockedAt: -1 })
  }

  async updateProgress(userId, id, current) {
    const achievement = await Achievement.findOne({ _id: id, userId, deletedAt: null })
    if (!achievement) return null
    const target = achievement.criteria?.target || 1
    const progress = Math.min(100, Math.round((current / target) * 100))
    return Achievement.findByIdAndUpdate(
      id,
      {
        $set: {
          'criteria.current': current,
          progress,
        },
      },
      { new: true, runValidators: true }
    )
  }

  async unlock(userId, id) {
    const achievement = await Achievement.findOne({ _id: id, userId, deletedAt: null })
    if (!achievement) return null
    const target = achievement.criteria?.target || 1
    return Achievement.findByIdAndUpdate(
      id,
      {
        unlockedAt: new Date(),
        progress: 100,
        'criteria.current': target,
      },
      { new: true, runValidators: true }
    )
  }

  async delete(userId, id) {
    return Achievement.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    )
  }

  _getTarget(id) {
    return Achievement.findById(id).then(a => a?.criteria?.target || 1)
  }
}
