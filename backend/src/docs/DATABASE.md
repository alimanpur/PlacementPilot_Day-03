# Database Documentation

## Overview

PlacementPilot uses MongoDB with Mongoose as the ODM. The database schema is designed to support all frontend features with proper indexing, relationships, and soft deletes.

## Models

### User

Stores user account information, preferences, and authentication data.

```javascript
{
  name: String,           // Required, min 2 chars
  email: String,          // Required, unique, lowercase
  password: String,       // Required, min 8 chars, hashed
  username: String,       // Unique, sparse
  role: String,           // 'user' | 'admin', default: 'user'
  season: String,         // Default: 'Fall 2026'
  school: String,
  program: String,
  location: String,
  timezone: String,       // Default: 'UTC'
  isEmailVerified: Boolean, // Default: false
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshToken: String,
  refreshTokenExpires: Date,
  skills: [String],
  publicLinks: {
    github: String,
    linkedin: String,
    portfolio: String,
  },
  notificationPreferences: {
    interviews: Boolean,
    weekly: Boolean,
    problems: Boolean,
    deadlines: Boolean,
    marketing: Boolean,
  },
  theme: String,          // 'dark' | 'night-flight' | 'high-contrast'
  deletedAt: Date,        // Soft delete
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
- `{ email: 1 }` - unique
- `{ username: 1 }` - unique, sparse

### Company

Tracks job applications and their progress through the pipeline.

```javascript
{
  code: String,           // Required, unique, uppercase
  name: String,           // Required
  role: String,           // Required
  location: String,       // Default: 'Remote'
  stage: String,          // 'Applied' | 'Screen' | 'Technical' | 'Final' | 'Offer' | 'Closed'
  progress: Number,       // 0-100, default: 0
  status: String,         // 'hot' | 'active' | 'queued' | 'offer' | 'closed'
  nextStep: String,
  userId: ObjectId,       // Required, ref: User
  notes: [{
    content: String,
    createdAt: Date,
  }],
  interviewRounds: [{
    round: String,
    type: String,         // 'behavioral' | 'technical' | 'screen' | 'team' | 'onsite' | 'system'
    when: Date,
    score: Number,        // 0-5
    status: String,       // 'upcoming' | 'cleared' | 'reviewed'
    debrief: String,
  }],
  intel: {
    loopRounds: Number,
    compBand: {
      base: Number,
      stock: Number,
      bonus: Number,
    },
    returnOfferRate: Number,
    notes: String,
  },
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
- `{ userId: 1, code: 1 }` - unique
- `{ userId: 1, status: 1 }`
- `{ userId: 1, progress: 1 }`

### Interview

Records interview rounds and their outcomes.

```javascript
{
  company: String,         // Required
  round: String,           // Required
  type: String,            // Required, enum
  when: Date,              // Required
  score: Number,           // 0-5
  status: String,          // 'upcoming' | 'cleared' | 'reviewed'
  debrief: String,
  userId: ObjectId,        // Required, ref: User
  companyId: ObjectId,     // ref: Company
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
- `{ userId: 1, when: 1 }`
- `{ userId: 1, status: 1 }`
- `{ userId: 1, company: 1 }`

### DSATopic

Tracks DSA topic mastery and progress.

```javascript
{
  topic: String,           // Required
  solved: Number,          // Min: 0, default: 0
  total: Number,           // Min: 0, required
  mastery: Number,         // 0-100, default: 0
  trend: String,           // 'up' | 'down' | 'flat'
  userId: ObjectId,        // Required, ref: User
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
- `{ userId: 1, topic: 1 }` - unique

### DSAProblem

Individual problem solving records.

```javascript
{
  title: String,           // Required
  topic: String,           // Required
  difficulty: String,      // 'easy' | 'medium' | 'hard'
  platform: String,        // 'leetcode' | 'hackerrank' | 'codeforces' | 'other'
  url: String,
  solvedAt: Date,
  userId: ObjectId,        // Required, ref: User
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
- `{ userId: 1, solvedAt: 1 }`
- `{ userId: 1, topic: 1 }`

### Goal

User goals and commitments.

```javascript
{
  title: String,           // Required
  progress: Number,         // 0-100, default: 0
  deadline: String,         // Required
  cadence: String,
  tone: String,             // 'brand' | 'accent' | 'muted'
  userId: ObjectId,        // Required, ref: User
  completedAt: Date,
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
- `{ userId: 1, deadline: 1 }`
- `{ userId: 1, completedAt: 1 }`

### Achievement

Milestone achievements unlocked by users.

```javascript
{
  title: String,           // Required
  meta: String,
  when: String,
  tier: String,             // 'gold' | 'silver' | 'bronze'
  userId: ObjectId,        // Required, ref: User
  unlockedAt: Date,
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
- `{ userId: 1, unlockedAt: -1 }`

### Notification

System notifications for users.

```javascript
{
  title: String,           // Required
  meta: String,
  when: String,
  tag: String,               // 'interview' | 'pipeline' | 'system' | 'learning'
  userId: ObjectId,        // Required, ref: User
  read: Boolean,           // Default: false
  readAt: Date,
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
- `{ userId: 1, read: 1 }`
- `{ userId: 1, createdAt: -1 }`

### PlannerTask

Weekly planner tasks and schedule.

```javascript
{
  title: String,           // Required
  meta: String,
  hour: String,
  day: String,             // 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  date: Date,              // Required
  tone: String,             // 'brand' | 'accent' | 'muted'
  done: Boolean,           // Default: false
  userId: ObjectId,        // Required, ref: User
  completedAt: Date,
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
- `{ userId: 1, date: 1 }`
- `{ userId: 1, done: 1 }`

## Relationships

```
User (1) ────< Company
User (1) ────< Interview
User (1) ────< DSATopic
User (1) ────< DSAProblem
User (1) ────< Goal
User (1) ────< Achievement
User (1) ────< Notification
User (1) ────< PlannerTask
Company (1) ────< Interview (optional)
```

## Soft Deletes

All models support soft deletes via the `deletedAt` field. Queries should filter by `{ deletedAt: null }` to exclude deleted records.

## Virtuals

User model includes a virtual for JSON transformation that excludes sensitive fields (password, refreshToken, tokens).