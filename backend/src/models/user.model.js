import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  season: {
    type: String,
    default: 'Fall 2026',
  },
  school: {
    type: String,
    default: '',
  },
  program: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshToken: String,
  refreshTokenExpires: Date,
  skills: [{
    type: String,
  }],
  publicLinks: {
    github: String,
    linkedin: String,
    portfolio: String,
    leetcode: String,
    codeforces: String,
    codechef: String,
    gfg: String,
  },
  profilePhoto: String,
  banner: String,
  headline: String,
  bio: String,
  phone: String,
  college: String,
  degree: String,
  branch: String,
  semester: String,
  graduationYear: String,
  interests: [String],
  languages: [String],
  resume: String,
  notificationPreferences: {
    interviews: { type: Boolean, default: true },
    weekly: { type: Boolean, default: true },
    problems: { type: Boolean, default: false },
    deadlines: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
  },
  theme: {
    type: String,
    enum: ['dark', 'night-flight', 'high-contrast'],
    default: 'dark',
  },
  onboarding: {
    completed: { type: Boolean, default: false },
    steps: {
      profileComplete: { type: Boolean, default: false },
      firstCompany: { type: Boolean, default: false },
      firstGoal: { type: Boolean, default: false },
      firstDsaLog: { type: Boolean, default: false },
      firstPlannerTask: { type: Boolean, default: false },
    },
    completedAt: Date,
  },
  deletedAt: Date,
}, {
  timestamps: true,
})

// Indexes are declared on the schema fields above via `unique: true` — no duplicate index() calls needed

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  delete user.refreshToken
  delete user.passwordResetToken
  return user
}

export const User = mongoose.model('User', userSchema)