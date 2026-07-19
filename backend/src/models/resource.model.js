import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['Interview Experience', 'OA Experience', 'Preparation Notes', 'Important Links', 'PDF', 'Video', 'Job Description', 'Reference Material', 'Other'],
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },

  // Content
  content: {
    type: String,
    trim: true,
  },
  url: {
    type: String,
    trim: true,
  },

  // Attachments
  attachments: [{
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['pdf', 'image', 'video', 'document', 'other'],
      default: 'other',
    },
    size: {
      type: Number,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],

  // Metadata
  tags: [{
    type: String,
    trim: true,
  }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Unknown'],
    default: 'Unknown',
  },
  round: {
    type: String,
    trim: true,
  },
  year: {
    type: Number,
  },

  // Company Reference
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },

  // Ownership
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // Soft Delete
  deletedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
})

// Indexes
resourceSchema.index({ userId: 1, companyId: 1 })
resourceSchema.index({ userId: 1, type: 1 })
resourceSchema.index({ userId: 1, round: 1 })
resourceSchema.index({ userId: 1, year: -1 })
resourceSchema.index({ userId: 1, difficulty: 1 })

export const Resource = mongoose.model('Resource', resourceSchema)