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
    return Achievement.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { 
        $set: { 'criteria.current': current },
        $set: { progress: Math.min(100, Math.round((current / (this._getTarget(id) || 1)) * 100)) }
      },
      { new: true, runValidators: true }
    )
  }

  async unlock(userId, id) {
    return Achievement.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { 
        unlockedAt: new Date(),
        progress: 100,
        'criteria.current': '$criteria.target'
      },
      { new: true, runValidators: true }
    )
  }

  async delete(userId, id) {
    return Achievement.findByIdAndUpdate(id, { deletedAt: new Date() })
  }

  _getTarget(id) {
    return Achievement.findById(id).then(a => a?.criteria?.target || 1)
  }
}
