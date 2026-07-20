import { z } from 'zod'

export const dsaTopicSchema = z.object({
  topic: z.string().min(1, 'Topic name is required').max(100),
  category: z.string().max(100).optional(),
  subtopics: z.array(z.string().max(100)).optional(),
  solved: z.number().min(0).optional(),
  total: z.number().min(0),
  mastery: z.number().min(0).max(100).optional(),
  trend: z.enum(['up', 'down', 'flat']).optional(),
  totalTimeSpent: z.number().min(0).optional(),
  averageSolveTime: z.number().min(0).optional(),
})

export const dsaProblemSchema = z.object({
  title: z.string().min(1, 'Problem title is required').max(300),
  problemId: z.string().max(50).optional(),
  url: z.string().url().optional().or(z.literal('')),
  platform: z.enum(['leetcode', 'hackerrank', 'codeforces', 'codechef', 'atcoder', 'gfg', 'other']).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  topic: z.string().min(1, 'Topic is required').max(100),
  subtopics: z.array(z.string().max(100)).optional(),
  tags: z.array(z.string().max(50)).optional(),
  companiesAsked: z.array(z.string().max(100)).optional(),
  frequency: z.number().min(0).max(100).optional(),
  pattern: z.string().max(100).optional(),
  status: z.enum(['not_started', 'started', 'solved', 'reviewed', 'mastered']).optional(),
  timeTaken: z.number().min(0).optional(),
  memory: z.string().max(50).optional(),
  notes: z.string().max(5000).optional(),
  hints: z.array(z.string().max(500)).optional(),
  editorialLink: z.string().url().optional().or(z.literal('')),
  videoSolution: z.string().url().optional().or(z.literal('')),
  codeSnippet: z.string().max(10000).optional(),
  language: z.string().max(50).optional(),
  rating: z.number().min(1).max(5).optional(),
  confidence: z.number().min(0).max(100).optional(),
  mistakes: z.string().max(2000).optional(),
  learnedConcepts: z.array(z.string().max(100)).optional(),
  favorite: z.boolean().optional(),
  bookmarked: z.boolean().optional(),
  starred: z.boolean().optional(),
  revisionSchedule: z.object({
    nextRevision: z.coerce.date().optional(),
    intervals: z.array(z.coerce.date()).optional(),
  }).optional(),
  reminder: z.object({
    enabled: z.boolean().optional(),
    date: z.coerce.date().optional(),
  }).optional(),
})

export const dsaSessionSchema = z.object({
  title: z.string().max(200).optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  problemsSolved: z.number().min(0).optional(),
  problemsAttempted: z.number().min(0).optional(),
  focusScore: z.number().min(0).max(100).optional(),
  streak: z.number().min(0).optional(),
  mood: z.enum(['great', 'good', 'neutral', 'frustrated', 'exhausted']).optional(),
  difficultyDistribution: z.object({
    easy: z.number().min(0).optional(),
    medium: z.number().min(0).optional(),
    hard: z.number().min(0).optional(),
  }).optional(),
  topicsPracticed: z.array(z.string().max(100)).optional(),
  notes: z.string().max(2000).optional(),
})

export const dsaRoadmapSchema = z.object({
  name: z.string().min(1, 'Roadmap name is required').max(200),
  type: z.enum(['blind75', 'neetCode150', 'striverSDE', 'loveBabbar', 'companySpecific', 'custom']),
  company: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  problems: z.array(z.object({
    problemId: z.string().min(1),
    order: z.number().min(1).optional(),
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    completedAt: z.coerce.date().optional(),
  })).optional(),
  isActive: z.boolean().optional(),
  startedAt: z.coerce.date().optional(),
})

export const dsaRevisionSchema = z.object({
  problem: z.string().min(1, 'Problem ID is required'),
  dueDate: z.coerce.date().optional(),
  status: z.enum(['pending', 'completed', 'missed', 'skipped']).optional(),
  revisionCount: z.number().min(1).optional(),
  interval: z.number().min(1).optional(),
})

export const dsaBulkActionSchema = z.object({
  ids: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid DSA ID')).min(1, 'At least one ID is required'),
  action: z.enum(['delete', 'favorite', 'unfavorite', 'bookmark', 'unbookmark', 'star', 'unstar', 'archive', 'unarchive']),
  data: z.object({}).optional(),
})

export const dsaSearchSchema = z.object({
  search: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().or(z.literal('')),
  topic: z.string().optional(),
  status: z.enum(['not_started', 'started', 'solved', 'reviewed', 'mastered']).optional().or(z.literal('')),
  platform: z.enum(['leetcode', 'hackerrank', 'codeforces', 'codechef', 'atcoder', 'gfg', 'other']).optional().or(z.literal('')),
  pattern: z.string().optional(),
  company: z.string().optional(),
  bookmarked: z.preprocess((val) => {
    if (val === 'true') return true
    if (val === 'false') return false
    return val
  }, z.boolean().optional()),
  favorite: z.preprocess((val) => {
    if (val === 'true') return true
    if (val === 'false') return false
    return val
  }, z.boolean().optional()),
  starred: z.preprocess((val) => {
    if (val === 'true') return true
    if (val === 'false') return false
    return val
  }, z.boolean().optional()),
  revisionDue: z.preprocess((val) => {
    if (val === 'true') return true
    if (val === 'false') return false
    return val
  }, z.boolean().optional()),
  tags: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().or(z.literal('')),
})

export const dsaIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid DSA ID'),
})

export const dsaProblemIdSchema = z.object({
  problemId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Problem ID'),
})
