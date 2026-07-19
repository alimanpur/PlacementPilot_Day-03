import mongoose from 'mongoose'

const hiringInfoSchema = new mongoose.Schema({
  // Eligibility
  minimumCgpa: {
    type: Number,
    min: 0,
    max: 10,
  },
  eligibleBranches: [{
    type: String,
    trim: true,
  }],
  eligibleBatch: [{
    type: String,
    trim: true,
  }],

  // Employment Details
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Intern + PPO'],
  },
  internshipDuration: {
    type: String,
    trim: true,
  },
  ppoConversionRate: {
    type: Number,
    min: 0,
    max: 100,
  },

  // Compensation
  expectedCtc: {
    type: Number,
    min: 0,
  },
  historicalCtc: [{
    year: Number,
    amount: Number,
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
  }],
  ctcBreakdown: {
    base: Number,
    variable: Number,
    bonus: Number,
    stock: Number,
    benefits: Number,
  },

  // Bond Information
  bondInformation: {
    hasBond: {
      type: Boolean,
      default: false,
    },
    bondDuration: {
      type: String,
      trim: true,
    },
    bondAmount: {
      type: Number,
      min: 0,
    },
    bondDescription: {
      type: String,
      trim: true,
    },
  },

  // Hiring Details
  hiringFrequency: {
    type: String,
    enum: ['Annual', 'Bi-annual', 'Quarterly', 'Monthly', 'As Needed', 'Unknown'],
    default: 'Unknown',
  },
  selectionProcess: {
    type: String,
    trim: true,
  },
  rounds: [{
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Online Assessment', 'Technical', 'HR', 'Managerial', 'System Design', 'Behavioral'],
    },
    duration: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  }],
  oaPlatform: {
    type: String,
    trim: true,
  },
  techStack: [{
    type: String,
    trim: true,
  }],
  importantSkills: [{
    type: String,
    trim: true,
  }],

  // Application Details
  applicationDeadline: {
    type: Date,
  },
  applicationLink: {
    type: String,
    trim: true,
  },
  recruitmentCycle: {
    type: String,
    enum: ['Summer Internship', 'Winter Internship', 'Full-time', 'Off-campus', 'On-campus', 'Referral'],
  },

  // Company Reference
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true,
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
hiringInfoSchema.index({ userId: 1, companyId: 1 }, { unique: true })
hiringInfoSchema.index({ userId: 1, employmentType: 1 })
hiringInfoSchema.index({ userId: 1, recruitmentCycle: 1 })
hiringInfoSchema.index({ userId: 1, applicationDeadline: 1 })

export const HiringInfo = mongoose.model('HiringInfo', hiringInfoSchema)