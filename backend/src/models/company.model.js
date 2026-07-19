import mongoose from 'mongoose'

const companySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    index: true,
  },
  logo: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  careerPage: {
    type: String,
    trim: true,
  },
  linkedIn: {
    type: String,
    trim: true,
  },

  // Classification
  industry: {
    type: String,
    trim: true,
    index: true,
  },
  sector: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },

  // Location
  headquarters: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
  founded: {
    type: Number,
  },

  // Company Details
  companySize: {
    type: String,
    trim: true,
  },
  companyType: {
    type: String,
    enum: ['Public', 'Private', 'Startup', 'MNC', 'Government'],
    default: 'Private',
  },
  stockSymbol: {
    type: String,
    trim: true,
    uppercase: true,
  },

  // Work & Employment
  workModes: [{
    type: String,
    enum: ['Remote', 'Hybrid', 'Onsite'],
  }],
  employmentTypes: [{
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
  }],

  // Status
  hiringStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'Archived'],
    default: 'Active',
    index: true,
  },
  active: {
    type: Boolean,
    default: true,
  },

  // User Preferences
  favorite: {
    type: Boolean,
    default: false,
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  },

  // Tags & Notes
  tags: [{
    type: String,
    trim: true,
    index: true,
  }],
  notes: {
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
      enum: ['pdf', 'image', 'document', 'other'],
      default: 'other',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],

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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // Soft Delete & Archive
  archived: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
    index: true,
  },

  // Computed Fields (denormalized for performance)
  stats: {
    applications: { type: Number, default: 0 },
    wishlist: { type: Number, default: 0 },
    applied: { type: Number, default: 0 },
    onlineAssessment: { type: Number, default: 0 },
    interviews: { type: Number, default: 0 },
    offers: { type: Number, default: 0 },
    accepted: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    withdrawn: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    offerRate: { type: Number, default: 0 },
    interviewRate: { type: Number, default: 0 },
    responseRate: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 },
    averageCtc: { type: Number, default: 0 },
    highestCtc: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
})

// Indexes for performance
companySchema.index({ userId: 1, name: 1 })
companySchema.index({ userId: 1, industry: 1 })
companySchema.index({ userId: 1, hiringStatus: 1 })
companySchema.index({ userId: 1, favorite: 1 })
companySchema.index({ userId: 1, priority: 1 })
companySchema.index({ userId: 1, archived: 1 })
companySchema.index({ userId: 1, createdAt: -1 })
companySchema.index({ userId: 1, tags: 1 })
companySchema.index({ userId: 1, companyType: 1 })
companySchema.index({ userId: 1, country: 1 })

export const Company = mongoose.model('Company', companySchema)