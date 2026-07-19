import { User } from '../models/user.model.js'

export class UserRepository {
  async create(data) {
    return User.create(data)
  }

  async findById(id) {
    return User.findById(id).select('-password -refreshToken -passwordResetToken').where('deletedAt').equals(null)
  }

  async findByEmail(email) {
    return User.findOne({ email }).select('+password')
  }

  async findByRefreshToken(refreshToken) {
    return User.findOne({ refreshToken })
  }

  async findByUsername(username) {
    return User.findOne({ username })
  }

  async update(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  }

  async updateRefreshToken(id, token, expires) {
    return User.findByIdAndUpdate(id, {
      refreshToken: token,
      refreshTokenExpires: expires,
    })
  }

  async updatePassword(id, hashedPassword) {
    return User.findByIdAndUpdate(id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    })
  }

  async setResetToken(email, token, expires) {
    return User.findOneAndUpdate(
      { email },
      {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    )
  }

  async findByResetToken(token) {
    return User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    })
  }

  async delete(id) {
    return User.findByIdAndUpdate(id, { deletedAt: new Date() })
  }

  async hardDelete(id) {
    return User.findByIdAndDelete(id)
  }

  async restore(id) {
    return User.findByIdAndUpdate(id, { deletedAt: null })
  }

  async getOnboardingStatus(id) {
    const user = await User.findById(id).select('onboarding')
    if (!user) return { completed: false, steps: {} }

    return {
      completed: user.onboarding?.completed || false,
      steps: user.onboarding?.steps || {},
      completedAt: user.onboarding?.completedAt,
    }
  }

  async updateOnboarding(id, steps) {
    const allComplete = Object.values(steps).every(Boolean)
    return User.findByIdAndUpdate(
      id,
      {
        'onboarding.steps': steps,
        'onboarding.completed': allComplete,
        'onboarding.completedAt': allComplete ? new Date() : null,
      },
      { new: true, runValidators: true }
    )
  }

  async hasCompleteProfile(id) {
    const user = await User.findById(id).select('name email school program location skills publicLinks season')
    if (!user) return false

    const requiredFields = ['name', 'email', 'school', 'program', 'location', 'skills', 'season']
    const filledFields = requiredFields.filter(field => {
      const value = user[field]
      return value && (Array.isArray(value) ? value.length > 0 : value.length > 0)
    })

    return filledFields.length === requiredFields.length
  }
}
