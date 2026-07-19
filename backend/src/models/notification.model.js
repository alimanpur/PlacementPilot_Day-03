import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
  },
  meta: {
    type: String,
    default: '',
  },
  when: {
    type: String,
    default: 'Just now',
  },
  tag: {
    type: String,
    enum: ['interview', 'pipeline', 'system', 'learning'],
    default: 'system',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  deletedAt: Date,
}, {
  timestamps: true,
})

notificationSchema.index({ userId: 1, read: 1 })
notificationSchema.index({ userId: 1, createdAt: -1 })

export const Notification = mongoose.model('Notification', notificationSchema)