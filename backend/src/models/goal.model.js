import mongoose from 'mongoose'

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: '',
  },
  category: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'target_company', 'solved_problems', 'interview', 'application', 'custom'],
    default: 'custom',
    index: true,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    index: true,
  },
  target: {
    type: Number,
    min: 0,
    default: 0,
  },
  current: {
    type: Number,
    min: 0,
    default: 0,
  },
  unit: {
    type: String,
    default: '',
    trim: true,
  },
  deadline: {
    type: Date,
    index: true,
  },
  cadence: {
    type: String,
    default: 'Weekly',
    trim: true,
  },
  tone: {
    type: String,
    enum: ['brand', 'accent', 'muted'],
    default: 'brand',
  },
  milestones: [{
    title: String,
    target: Number,
    current: Number,
    unit: String,
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'paused'],
    default: 'active',
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  completedAt: Date,
  deletedAt: {
    type: Date,
    default: null,
    index: true,
  },
}, {
  timestamps: true,
})

goalSchema.index({ userId: 1, category: 1, status: 1 })
goalSchema.index({ userId: 1, deadline: 1, status: 1 })
goalSchema.index({ userId: 1, progress: 1 })

export const Goal = mongoose.model('Goal', goalSchema)
