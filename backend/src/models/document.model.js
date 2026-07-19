import mongoose from 'mongoose'

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['resume', 'cover_letter', 'certificate', 'portfolio', 'offer_letter', 'transcript', 'other'],
    required: true,
  },
  url: {
    type: String,
    required: [true, 'Document URL is required'],
    trim: true,
  },
  size: {
    type: Number,
  },
  mimeType: {
    type: String,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  archived: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
})

documentSchema.index({ userId: 1, type: 1 })
documentSchema.index({ userId: 1, createdAt: -1 })

export const Document = mongoose.model('Document', documentSchema)
