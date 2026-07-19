import mongoose from 'mongoose'

const plannerTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: '',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'],
    default: 'pending',
    index: true,
  },
  category: {
    type: String,
    enum: ['placement', 'interview_prep', 'dsa', 'projects', 'resume', 'applications', 'mock_interview', 'revision', 'personal', 'custom'],
    default: 'custom',
    index: true,
  },
  estimatedTime: {
    type: Number,
    min: 0,
    default: 0,
  },
  actualTime: {
    type: Number,
    min: 0,
    default: 0,
  },
  deadline: {
    type: Date,
    index: true,
  },
  startDate: {
    type: Date,
    index: true,
  },
  dueDate: {
    type: Date,
    index: true,
  },
  completedDate: {
    type: Date,
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false,
    },
    date: Date,
  },
  repeatRule: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'biweekly', 'monthly', 'custom'],
    default: 'none',
  },
  repeatInterval: {
    type: Number,
    min: 1,
    default: 1,
  },
  repeatEndDate: Date,
  parentTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlannerTask',
  },
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlannerTask',
  }],
  checklist: [{
    item: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
  }],
  color: {
    type: String,
    default: '#3b82f6',
    maxlength: [7, 'Color must be a valid hex code'],
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters'],
    index: true,
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [5000, 'Notes cannot exceed 5000 characters'],
    default: '',
  },
  attachments: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
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
  calendarEvent: {
    title: String,
    start: Date,
    end: Date,
    allDay: {
      type: Boolean,
      default: false,
    },
    location: String,
    description: String,
  },
  linkedModule: {
    type: String,
    enum: ['interview', 'application', 'company', 'dsa', 'goal', 'habit', 'none'],
    default: 'none',
    index: true,
  },
  linkedId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  linkedType: {
    type: String,
    enum: ['interview', 'application', 'company', 'dsa_problem', 'dsa_revision', 'dsa_roadmap', 'goal', 'habit', 'none'],
    default: 'none',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
}, {
  timestamps: true,
})

plannerTaskSchema.index({ userId: 1, status: 1, category: 1 })
plannerTaskSchema.index({ userId: 1, deadline: 1, status: 1 })
plannerTaskSchema.index({ userId: 1, dueDate: 1, status: 1 })
plannerTaskSchema.index({ userId: 1, linkedModule: 1, linkedId: 1 })
plannerTaskSchema.index({ userId: 1, priority: 1, status: 1 })
plannerTaskSchema.index({ userId: 1, createdAt: -1 })
plannerTaskSchema.index({ userId: 1, tags: 1 })
plannerTaskSchema.index({ userId: 1, archived: 1 })

export const PlannerTask = mongoose.model('PlannerTask', plannerTaskSchema)

const plannerHabitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Habit name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  category: {
    type: String,
    enum: ['dsa', 'applications', 'mock_interview', 'resume', 'projects', 'personal', 'custom'],
    default: 'custom',
    index: true,
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'custom'],
    default: 'daily',
  },
  frequencyDays: [{
    type: Number,
    min: 0,
    max: 6,
  }],
  target: {
    type: Number,
    min: 1,
    default: 1,
  },
  unit: {
    type: String,
    default: 'times',
  },
  streak: {
    type: Number,
    min: 0,
    default: 0,
  },
  bestStreak: {
    type: Number,
    min: 0,
    default: 0,
  },
  completionRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  completedDates: [{
    date: {
      type: Date,
      required: true,
    },
    value: {
      type: Number,
      min: 0,
      default: 1,
    },
  }],
  reminders: [{
    time: String,
    enabled: {
      type: Boolean,
      default: true,
    },
  }],
  color: {
    type: String,
    default: '#3b82f6',
    maxlength: [7, 'Color must be a valid hex code'],
  },
  icon: {
    type: String,
    default: '🎯',
    maxlength: [2, 'Icon must be a single emoji'],
  },
  active: {
    type: Boolean,
    default: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
    index: true,
  },
}, {
  timestamps: true,
})

plannerHabitSchema.index({ userId: 1, active: 1, category: 1 })
plannerHabitSchema.index({ userId: 1, createdAt: -1 })

export const PlannerHabit = mongoose.model('PlannerHabit', plannerHabitSchema)
