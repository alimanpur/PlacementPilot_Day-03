import mongoose from 'mongoose'

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Achievement title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '🏆',
  },
  category: {
    type: String,
    enum: ['applications', 'interviews', 'dsa', 'planner', 'profile', 'milestone'],
    default: 'milestone',
  },
  criteria: {
    type: {
      type: String,
      enum: ['count', 'streak', 'milestone', 'custom'],
      default: 'count',
    },
    target: {
      type: Number,
      default: 1,
    },
    current: {
      type: Number,
      default: 0,
    },
    module: {
      type: String,
      enum: ['applications', 'interviews', 'dsa', 'planner', 'profile', 'general'],
      default: 'general',
    },
    field: {
      type: String,
      default: '',
    },
  },
  meta: {
    type: String,
    default: '',
  },
  when: {
    type: String,
    default: 'Just now',
  },
  tier: {
    type: String,
    enum: ['gold', 'silver', 'bronze'],
    default: 'bronze',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  },
  progress: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
})

achievementSchema.index({ userId: 1, unlockedAt: -1 })
achievementSchema.index({ userId: 1, category: 1 })

export const Achievement = mongoose.model('Achievement', achievementSchema)
