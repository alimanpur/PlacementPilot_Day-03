import mongoose from 'mongoose'

const interviewSchema = new mongoose.Schema({
  // Company Reference (from Application or standalone)
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },

  // Application Reference
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
  },

  // Role
  role: {
    type: String,
    trim: true,
  },

  // Interview Type
  type: {
    type: String,
    enum: [
      'phone_screen',
      'recruiter_call',
      'online_assessment_review',
      'technical_interview',
      'live_coding',
      'system_design',
      'managerial',
      'behavioral',
      'hr',
      'final_round',
      'bar_raiser',
      'group_discussion',
      'case_study',
      'custom',
    ],
    required: [true, 'Interview type is required'],
  },
  customTypeLabel: {
    type: String,
    trim: true,
  },

  // Interview Round
  round: {
    type: String,
    required: [true, 'Round name is required'],
    trim: true,
  },
  roundNumber: {
    type: Number,
    min: 1,
    default: 1,
  },

  // Interview Mode
  mode: {
    type: String,
    enum: ['online', 'phone', 'onsite', 'video_call'],
    default: 'video_call',
  },

  // Status
  status: {
    type: String,
    enum: [
      'scheduled',
      'rescheduled',
      'completed',
      'cancelled',
      'no_show',
      'pending_feedback',
    ],
    default: 'scheduled',
  },

  // Scheduling
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required'],
  },
  scheduledTime: {
    type: String,
    required: [true, 'Scheduled time is required'],
  },
  duration: {
    type: Number,
    default: 60,
    min: 15,
  },
  timezone: {
    type: String,
    default: 'UTC',
  },

  // Meeting Details
  meetingLink: {
    type: String,
    trim: true,
  },
  meetingPlatform: {
    type: String,
    enum: ['google_meet', 'zoom', 'teams', 'skype', 'phone', 'in_person', 'other'],
    default: 'google_meet',
  },
  officeAddress: {
    type: String,
    trim: true,
  },
  dialIn: {
    type: String,
    trim: true,
  },

  // Recruiter / Interviewer(s)
  recruiterName: {
    type: String,
    trim: true,
  },
  recruiterEmail: {
    type: String,
    trim: true,
  },
  recruiterPhone: {
    type: String,
    trim: true,
  },
  recruiterLinkedIn: {
    type: String,
    trim: true,
  },
  interviewers: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    linkedIn: {
      type: String,
      trim: true,
    },
  }],

  // Preparation Center
  preparation: {
    checklist: [{
      item: {
        type: String,
        required: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: Date,
    }],
    preparationNotes: {
      type: String,
      trim: true,
    },
    dsaTopics: [{
      type: String,
      trim: true,
    }],
    systemDesignTopics: [{
      type: String,
      trim: true,
    }],
    behavioralTopics: [{
      type: String,
      trim: true,
    }],
    companyResources: [{
      title: String,
      url: String,
    }],
    previousExperiences: [{
      type: String,
      trim: true,
    }],
    requiredDocuments: [{
      name: String,
      url: String,
      uploaded: {
        type: Boolean,
        default: false,
      },
    }],
    customNotes: {
      type: String,
      trim: true,
    },
    completionProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },

  // Feedback & Results
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'very_hard'],
    },
    questionsAsked: [{
      type: String,
      trim: true,
    }],
    strengths: {
      type: String,
      trim: true,
    },
    weaknesses: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    decision: {
      type: String,
      enum: ['selected', 'rejected', 'on_hold', 'further_rounds', 'no_decision'],
    },
    nextRound: {
      type: String,
      trim: true,
    },
    improvementNotes: {
      type: String,
      trim: true,
    },
    submittedAt: Date,
  },

  // Result
  result: {
    type: String,
    enum: ['pass', 'fail', 'hold', 'pending', 'not_applicable'],
    default: 'pending',
  },

  // Follow-up
  followUpDate: {
    type: Date,
  },
  followUpNotes: {
    type: String,
    trim: true,
  },

  // Reminder Settings
  reminderSettings: {
    enabled: {
      type: Boolean,
      default: true,
    },
    remind24h: {
      type: Boolean,
      default: true,
    },
    remind1h: {
      type: Boolean,
      default: true,
    },
    remind15m: {
      type: Boolean,
      default: false,
    },
    feedbackReminder: {
      type: Boolean,
      default: true,
    },
  },

  // Timeline
  timeline: [{
    action: {
      type: String,
      required: true,
    },
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
      enum: ['resume', 'portfolio', 'assignment', 'notes', 'feedback', 'other'],
      default: 'other',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],

  // Notes
  notes: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],

  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },

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
  owner: {
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
interviewSchema.index({ userId: 1, scheduledDate: 1 })
interviewSchema.index({ userId: 1, status: 1 })
interviewSchema.index({ userId: 1, type: 1 })
interviewSchema.index({ userId: 1, company: 1 })
interviewSchema.index({ userId: 1, applicationId: 1 })
interviewSchema.index({ userId: 1, companyId: 1 })
interviewSchema.index({ userId: 1, archived: 1 })
interviewSchema.index({ userId: 1, deletedAt: 1 })
interviewSchema.index({ userId: 1, priority: 1 })
interviewSchema.index({ userId: 1, result: 1 })
interviewSchema.index({ userId: 1, createdAt: -1 })
interviewSchema.index({ userId: 1, scheduledDate: 1, status: 1 })
interviewSchema.index({ userId: 1, companyId: 1, status: 1 })
interviewSchema.index({ userId: 1, applicationId: 1, status: 1 })
interviewSchema.index({ userId: 1, 'feedback.decision': 1 })
interviewSchema.index({ userId: 1, 'preparation.completionProgress': 1 })

export const Interview = mongoose.model('Interview', interviewSchema)