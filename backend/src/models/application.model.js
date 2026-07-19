import mongoose from 'mongoose'

const applicationSchema = new mongoose.Schema({
  // Company Information
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  jobId: {
    type: String,
    trim: true,
  },

  // Employment Details
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    default: 'Full-time',
  },
  workMode: {
    type: String,
    enum: ['Remote', 'Hybrid', 'Onsite'],
    default: 'Onsite',
  },
  location: {
    type: String,
    trim: true,
  },
  package: {
    type: Number,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true,
  },

  // Source & Recruiter
  source: {
    type: String,
    enum: ['LinkedIn', 'Company Website', 'Referral', 'Job Portal', 'Campus', 'Recruiter', 'Other'],
    default: 'Other',
  },
  recruiterName: {
    type: String,
    trim: true,
  },
  recruiterEmail: {
    type: String,
    trim: true,
  },
  recruiterLinkedIn: {
    type: String,
    trim: true,
  },

  // Documents
  resumeVersion: {
    type: String,
    trim: true,
  },
  coverLetter: {
    type: String,
    trim: true,
  },
  portfolioLink: {
    type: String,
    trim: true,
  },

  // Important Dates
  appliedDate: {
    type: Date,
  },
  deadline: {
    type: Date,
  },
  expectedJoining: {
    type: Date,
  },
  reminderDate: {
    type: Date,
  },

  // Pipeline
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  currentStage: {
    type: String,
    enum: [
      'wishlist',
      'ready_to_apply',
      'applied',
      'online_assessment',
      'technical_interview',
      'managerial_interview',
      'hr_interview',
      'offer',
      'accepted',
      'rejected',
      'withdrawn',
    ],
    default: 'wishlist',
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'on_hold', 'completed', 'cancelled'],
    default: 'active',
  },

  // Additional Information
  notes: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],

  // Timeline
  timeline: [{
    action: {
      type: String,
      required: true,
    },
    fromStage: String,
    toStage: String,
    fromStatus: String,
    toStatus: String,
    description: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],

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
      enum: ['resume', 'cover_letter', 'offer_letter', 'job_description', 'other'],
      default: 'other',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],

  // User & Ownership
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

  // Soft Delete & Archive
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

// Indexes for performance
applicationSchema.index({ userId: 1, company: 1 })
applicationSchema.index({ userId: 1, currentStage: 1 })
applicationSchema.index({ userId: 1, status: 1 })
applicationSchema.index({ userId: 1, priority: 1 })
applicationSchema.index({ userId: 1, appliedDate: -1 })
applicationSchema.index({ userId: 1, deadline: 1 })
applicationSchema.index({ userId: 1, archived: 1 })
applicationSchema.index({ userId: 1, createdAt: -1 })
applicationSchema.index({ userId: 1, company: 1, role: 1 })

export const Application = mongoose.model('Application', applicationSchema)