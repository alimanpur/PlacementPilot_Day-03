import mongoose from 'mongoose'

const dsaProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true,
    index: true,
  },
  problemId: {
    type: String,
    trim: true,
    index: true,
  },
  url: {
    type: String,
    trim: true,
  },
  platform: {
    type: String,
    enum: ['leetcode', 'hackerrank', 'codeforces', 'codechef', 'atcoder', 'gfg', 'other'],
    default: 'other',
    index: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: [true, 'Difficulty is required'],
    index: true,
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
    index: true,
  },
  subtopics: [{
    type: String,
    trim: true,
  }],
  tags: [{
    type: String,
    trim: true,
    index: true,
  }],
  companiesAsked: [{
    type: String,
    trim: true,
  }],
  frequency: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  pattern: {
    type: String,
    trim: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['not_started', 'started', 'solved', 'reviewed', 'mastered'],
    default: 'not_started',
    index: true,
  },
  started: {
    type: Boolean,
    default: false,
  },
  startedAt: Date,
  solvedAt: Date,
  revisionCount: {
    type: Number,
    min: 0,
    default: 0,
  },
  attemptCount: {
    type: Number,
    min: 0,
    default: 0,
  },
  timeTaken: {
    type: Number,
    min: 0,
  },
  memory: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  hints: [{
    type: String,
    trim: true,
  }],
  editorialLink: {
    type: String,
    trim: true,
  },
  videoSolution: {
    type: String,
    trim: true,
  },
  codeSnippet: {
    type: String,
    trim: true,
  },
  language: {
    type: String,
    trim: true,
    default: 'javascript',
  },
  submissionDate: Date,
  favorite: {
    type: Boolean,
    default: false,
    index: true,
  },
  bookmarked: {
    type: Boolean,
    default: false,
    index: true,
  },
  starred: {
    type: Boolean,
    default: false,
    index: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  mistakes: {
    type: String,
    trim: true,
  },
  learnedConcepts: [{
    type: String,
    trim: true,
  }],
  revisionSchedule: {
    nextRevision: Date,
    intervals: [Date],
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false,
    },
    date: Date,
  },
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
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
}, {
  timestamps: true,
})

dsaProblemSchema.index({ userId: 1, topic: 1, difficulty: 1 })
dsaProblemSchema.index({ userId: 1, status: 1, difficulty: 1 })
dsaProblemSchema.index({ userId: 1, solvedAt: -1 })
dsaProblemSchema.index({ userId: 1, favorite: 1, bookmarked: 1 })
dsaProblemSchema.index({ userId: 1, pattern: 1 })
dsaProblemSchema.index({ userId: 1, companiesAsked: 1 })
dsaProblemSchema.index({ userId: 1, revisionSchedule: 1 })
dsaProblemSchema.index({ userId: 1, createdAt: -1 })

export const DSAProblem = mongoose.model('DSAProblem', dsaProblemSchema)

const dsaTopicSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: [true, 'Topic name is required'],
    trim: true,
    index: true,
  },
  category: {
    type: String,
    trim: true,
    index: true,
  },
  subtopics: [{
    type: String,
    trim: true,
  }],
  solved: {
    type: Number,
    min: 0,
    default: 0,
  },
  total: {
    type: Number,
    min: 0,
    required: [true, 'Total problems is required'],
  },
  mastery: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  trend: {
    type: String,
    enum: ['up', 'down', 'flat'],
    default: 'flat',
  },
  totalTimeSpent: {
    type: Number,
    min: 0,
    default: 0,
  },
  averageSolveTime: {
    type: Number,
    min: 0,
    default: 0,
  },
  weak: {
    type: Boolean,
    default: false,
    index: true,
  },
  roadmapIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DSARoadmap',
  }],
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

dsaTopicSchema.index({ userId: 1, topic: 1 }, { unique: true })
dsaTopicSchema.index({ userId: 1, mastery: 1 })
dsaTopicSchema.index({ userId: 1, weak: 1 })

export const DSATopic = mongoose.model('DSATopic', dsaTopicSchema)

const dsaSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: Date,
  },
  problemsSolved: {
    type: Number,
    min: 0,
    default: 0,
  },
  problemsAttempted: {
    type: Number,
    min: 0,
    default: 0,
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 100,
  },
  focusScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  streak: {
    type: Number,
    min: 0,
    default: 0,
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'neutral', 'frustrated', 'exhausted'],
  },
  difficultyDistribution: {
    easy: { type: Number, min: 0, default: 0 },
    medium: { type: Number, min: 0, default: 0 },
    hard: { type: Number, min: 0, default: 0 },
  },
  topicsPracticed: [{
    type: String,
    trim: true,
  }],
  notes: {
    type: String,
    trim: true,
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

dsaSessionSchema.index({ userId: 1, startTime: -1 })
dsaSessionSchema.index({ userId: 1, createdAt: -1 })

export const DSASession = mongoose.model('DSASession', dsaSessionSchema)

const dsaRoadmapSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Roadmap name is required'],
    trim: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['blind75', 'neetCode150', 'striverSDE', 'loveBabbar', 'companySpecific', 'custom'],
    required: [true, 'Roadmap type is required'],
    index: true,
  },
  company: {
    type: String,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  problems: [{
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DSAProblem',
    },
    order: {
      type: Number,
      min: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    completedAt: Date,
  }],
  totalProblems: {
    type: Number,
    min: 0,
    default: 0,
  },
  completedProblems: {
    type: Number,
    min: 0,
    default: 0,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: false,
    index: true,
  },
  startedAt: Date,
  completedAt: Date,
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

dsaRoadmapSchema.index({ userId: 1, type: 1 })
dsaRoadmapSchema.index({ userId: 1, isActive: 1 })
dsaRoadmapSchema.index({ userId: 1, company: 1 })

export const DSARoadmap = mongoose.model('DSARoadmap', dsaRoadmapSchema)

const dsaRevisionSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DSAProblem',
    required: true,
  },
  problemTitle: {
    type: String,
    trim: true,
  },
  problemDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
  },
  problemTopic: {
    type: String,
    trim: true,
  },
  dueDate: {
    type: Date,
    required: true,
    index: true,
  },
  completedAt: Date,
  status: {
    type: String,
    enum: ['pending', 'completed', 'missed', 'skipped'],
    default: 'pending',
    index: true,
  },
  revisionCount: {
    type: Number,
    min: 0,
    default: 1,
  },
  interval: {
    type: Number,
    min: 1,
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

dsaRevisionSchema.index({ userId: 1, dueDate: 1, status: 1 })
dsaRevisionSchema.index({ userId: 1, status: 1 })

export const DSARevision = mongoose.model('DSARevision', dsaRevisionSchema)

const dsaHeatmapSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    index: true,
  },
  count: {
    type: Number,
    min: 0,
    default: 0,
  },
  problems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DSAProblem',
  }],
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DSASession',
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
}, {
  timestamps: true,
})

dsaHeatmapSchema.index({ userId: 1, date: 1 }, { unique: true })

export const DSAHeatmap = mongoose.model('DSAHeatmap', dsaHeatmapSchema)
