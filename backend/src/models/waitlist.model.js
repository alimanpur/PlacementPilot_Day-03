import mongoose from 'mongoose'

const waitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  name: {
    type: String,
    trim: true,
    default: '',
  },
  source: {
    type: String,
    default: 'pricing-page',
  },
  notified: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
}, {
  timestamps: true,
})

waitlistSchema.index({ email: 1 })
waitlistSchema.index({ createdAt: -1 })

export const Waitlist = mongoose.model('Waitlist', waitlistSchema)
