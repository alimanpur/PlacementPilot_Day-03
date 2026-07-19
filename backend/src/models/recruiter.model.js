import mongoose from 'mongoose'

const recruiterSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Recruiter name is required'],
    trim: true,
  },
  role: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  linkedIn: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },

  // Relationship
  relationshipStatus: {
    type: String,
    enum: ['Contacted', 'Responded', 'In Conversation', 'Interview Scheduled', 'Offer Extended', 'Closed'],
    default: 'Contacted',
  },

  // Follow-up
  lastContact: {
    type: Date,
  },
  nextFollowUp: {
    type: Date,
  },

  // Notes
  notes: {
    type: String,
    trim: true,
  },

  // Timeline
  timeline: [{
    action: {
      type: String,
      required: true,
    },
    description: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],

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
recruiterSchema.index({ userId: 1, companyId: 1 })
recruiterSchema.index({ userId: 1, relationshipStatus: 1 })
recruiterSchema.index({ userId: 1, nextFollowUp: 1 })
recruiterSchema.index({ userId: 1, email: 1 })

export const Recruiter = mongoose.model('Recruiter', recruiterSchema)