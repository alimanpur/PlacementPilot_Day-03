import mongoose from 'mongoose'

const skillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['Programming Language', 'Framework', 'Database', 'Tool', 'Soft Skill', 'CS Fundamentals', 'Other'],
    required: true,
  },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner',
  },
  level: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
    default: 0,
  },
  lastUsed: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
})

skillSchema.index({ userId: 1, category: 1 })
skillSchema.index({ userId: 1, proficiency: 1 })

export const Skill = mongoose.model('Skill', skillSchema)
