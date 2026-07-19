import { DSAService } from '../services/dsa.service.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'
import { validate } from '../middlewares/validate.js'
import {
  dsaTopicSchema,
  dsaProblemSchema,
  dsaSessionSchema,
  dsaRoadmapSchema,
  dsaRevisionSchema,
  dsaBulkActionSchema,
  dsaSearchSchema,
  dsaIdSchema,
} from '../validators/dsa.validator.js'

const dsaService = new DSAService()

// ── Topics ──────────────────────────────────────────────────────────────

export const createTopic = asyncWrapper(async (req, res) => {
  const topic = await dsaService.createTopic(req.user._id, req.body)
  res.status(201).json({
    success: true,
    message: 'Topic created successfully',
    data: { topic },
  })
})

export const getTopics = asyncWrapper(async (req, res) => {
  const topics = await dsaService.getTopics(req.user._id)
  res.json({
    success: true,
    message: 'Topics retrieved',
    data: { topics },
  })
})

export const getTopic = asyncWrapper(async (req, res) => {
  const topic = await dsaService.getTopic(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Topic retrieved',
    data: { topic },
  })
})

export const updateTopic = asyncWrapper(async (req, res) => {
  const topic = await dsaService.updateTopic(req.user._id, req.params.id, req.body)
  res.json({
    success: true,
    message: 'Topic updated successfully',
    data: { topic },
  })
})

export const deleteTopic = asyncWrapper(async (req, res) => {
  const topic = await dsaService.deleteTopic(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Topic deleted successfully',
    data: null,
  })
})

// ── Problems ────────────────────────────────────────────────────────────

export const createProblem = asyncWrapper(async (req, res) => {
  const problem = await dsaService.logProblem(req.user._id, req.body)
  res.status(201).json({
    success: true,
    message: 'Problem logged successfully',
    data: { problem },
  })
})

export const getProblems = asyncWrapper(async (req, res) => {
  const options = {
    ...req.query,
    page: req.query.page || 1,
    limit: req.query.limit || 20,
  }
  const result = await dsaService.getProblems(req.user._id, options)
  res.json({
    success: true,
    message: 'Problems retrieved',
    data: result,
  })
})

export const getProblem = asyncWrapper(async (req, res) => {
  const problem = await dsaService.getProblem(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Problem retrieved',
    data: { problem },
  })
})

export const updateProblem = asyncWrapper(async (req, res) => {
  const problem = await dsaService.updateProblem(req.user._id, req.params.id, req.body)
  res.json({
    success: true,
    message: 'Problem updated successfully',
    data: { problem },
  })
})

export const deleteProblem = asyncWrapper(async (req, res) => {
  const result = await dsaService.deleteProblem(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Problem deleted successfully',
    data: null,
  })
})

export const bulkUpdateProblems = asyncWrapper(async (req, res) => {
  const { ids, action, data } = req.body
  let result
  switch (action) {
    case 'delete':
      result = await dsaService.bulkDeleteProblems(req.user._id, ids)
      break
    default:
      result = await dsaService.bulkUpdateProblems(req.user._id, ids, data)
  }
  res.json({
    success: true,
    message: `Bulk ${action} completed`,
    data: result,
  })
})

export const toggleFavorite = asyncWrapper(async (req, res) => {
  const problem = await dsaService.toggleFavorite(req.user._id, req.params.id)
  res.json({
    success: true,
    message: problem.favorite ? 'Added to favorites' : 'Removed from favorites',
    data: { problem },
  })
})

export const toggleBookmark = asyncWrapper(async (req, res) => {
  const problem = await dsaService.toggleBookmark(req.user._id, req.params.id)
  res.json({
    success: true,
    message: problem.bookmarked ? 'Bookmarked' : 'Bookmark removed',
    data: { problem },
  })
})

export const toggleStar = asyncWrapper(async (req, res) => {
  const problem = await dsaService.toggleStar(req.user._id, req.params.id)
  res.json({
    success: true,
    message: problem.starred ? 'Starred' : 'Star removed',
    data: { problem },
  })
})

export const getBookmarks = asyncWrapper(async (req, res) => {
  const options = { ...req.query, bookmarked: true }
  const result = await dsaService.getBookmarks(req.user._id, options)
  res.json({
    success: true,
    message: 'Bookmarks retrieved',
    data: result,
  })
})

export const getFavorites = asyncWrapper(async (req, res) => {
  const options = { ...req.query, favorite: true }
  const result = await dsaService.getFavorites(req.user._id, options)
  res.json({
    success: true,
    message: 'Favorites retrieved',
    data: result,
  })
})

// ── Sessions ────────────────────────────────────────────────────────────

export const createSession = asyncWrapper(async (req, res) => {
  const session = await dsaService.createSession(req.user._id, req.body)
  res.status(201).json({
    success: true,
    message: 'Session created successfully',
    data: { session },
  })
})

export const getSessions = asyncWrapper(async (req, res) => {
  const options = {
    page: req.query.page || 1,
    limit: req.query.limit || 20,
    sortBy: req.query.sortBy || 'startTime',
    sortOrder: req.query.sortOrder || 'desc',
  }
  const result = await dsaService.getSessions(req.user._id, options)
  res.json({
    success: true,
    message: 'Sessions retrieved',
    data: result,
  })
})

export const getSession = asyncWrapper(async (req, res) => {
  const session = await dsaService.getSession(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Session retrieved',
    data: { session },
  })
})

export const updateSession = asyncWrapper(async (req, res) => {
  const session = await dsaService.updateSession(req.user._id, req.params.id, req.body)
  res.json({
    success: true,
    message: 'Session updated successfully',
    data: { session },
  })
})

export const endSession = asyncWrapper(async (req, res) => {
  const session = await dsaService.endSession(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Session ended successfully',
    data: { session },
  })
})

export const deleteSession = asyncWrapper(async (req, res) => {
  const result = await dsaService.deleteSession(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Session deleted successfully',
    data: null,
  })
})

// ── Roadmaps ────────────────────────────────────────────────────────────

export const createRoadmap = asyncWrapper(async (req, res) => {
  const roadmap = await dsaService.createRoadmap(req.user._id, req.body)
  res.status(201).json({
    success: true,
    message: 'Roadmap created successfully',
    data: { roadmap },
  })
})

export const getRoadmaps = asyncWrapper(async (req, res) => {
  const roadmaps = await dsaService.getRoadmaps(req.user._id)
  res.json({
    success: true,
    message: 'Roadmaps retrieved',
    data: { roadmaps },
  })
})

export const getRoadmap = asyncWrapper(async (req, res) => {
  const roadmap = await dsaService.getRoadmap(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Roadmap retrieved',
    data: { roadmap },
  })
})

export const updateRoadmap = asyncWrapper(async (req, res) => {
  const roadmap = await dsaService.updateRoadmap(req.user._id, req.params.id, req.body)
  res.json({
    success: true,
    message: 'Roadmap updated successfully',
    data: { roadmap },
  })
})

export const deleteRoadmap = asyncWrapper(async (req, res) => {
  const result = await dsaService.deleteRoadmap(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Roadmap deleted successfully',
    data: null,
  })
})

export const completeRoadmapProblem = asyncWrapper(async (req, res) => {
  const roadmap = await dsaService.completeRoadmapProblem(req.user._id, req.params.id, req.body.problemId)
  res.json({
    success: true,
    message: 'Roadmap problem marked as completed',
    data: { roadmap },
  })
})

export const getRoadmapProgress = asyncWrapper(async (req, res) => {
  const progress = await dsaService.getRoadmapProgress(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Roadmap progress retrieved',
    data: progress,
  })
})

// ── Revisions ───────────────────────────────────────────────────────────

export const createRevision = asyncWrapper(async (req, res) => {
  const revision = await dsaService.createRevision(req.user._id, req.body)
  res.status(201).json({
    success: true,
    message: 'Revision created successfully',
    data: { revision },
  })
})

export const getRevisions = asyncWrapper(async (req, res) => {
  const filters = {
    status: req.query.status,
    dueDate: req.query.dueDate,
  }
  const revisions = await dsaService.getRevisions(req.user._id, filters)
  res.json({
    success: true,
    message: 'Revisions retrieved',
    data: { revisions },
  })
})

export const getRevision = asyncWrapper(async (req, res) => {
  const revision = await dsaService.getRevision(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Revision retrieved',
    data: { revision },
  })
})

export const updateRevision = asyncWrapper(async (req, res) => {
  const revision = await dsaService.updateRevision(req.user._id, req.params.id, req.body)
  res.json({
    success: true,
    message: 'Revision updated successfully',
    data: { revision },
  })
})

export const completeRevision = asyncWrapper(async (req, res) => {
  const revision = await dsaService.completeRevision(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Revision completed successfully',
    data: { revision },
  })
})

export const skipRevision = asyncWrapper(async (req, res) => {
  const revision = await dsaService.skipRevision(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Revision skipped',
    data: { revision },
  })
})

export const deleteRevision = asyncWrapper(async (req, res) => {
  const result = await dsaService.deleteRevision(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Revision deleted successfully',
    data: null,
  })
})

export const getDailyRevisionQueue = asyncWrapper(async (req, res) => {
  const revisions = await dsaService.getDailyRevisionQueue(req.user._id)
  res.json({
    success: true,
    message: 'Daily revision queue retrieved',
    data: { revisions },
  })
})

export const getWeeklyRevisionQueue = asyncWrapper(async (req, res) => {
  const revisions = await dsaService.getWeeklyRevisionQueue(req.user._id)
  res.json({
    success: true,
    message: 'Weekly revision queue retrieved',
    data: { revisions },
  })
})

export const getMissedRevisions = asyncWrapper(async (req, res) => {
  const revisions = await dsaService.getMissedRevisions(req.user._id)
  res.json({
    success: true,
    message: 'Missed revisions retrieved',
    data: { revisions },
  })
})

// ── Analytics ────────────────────────────────────────────────────────────

export const getInsights = asyncWrapper(async (req, res) => {
  const insights = await dsaService.getInsights(req.user._id)
  res.json({
    success: true,
    message: 'DSA insights retrieved',
    data: insights,
  })
})

export const getHeatmap = asyncWrapper(async (req, res) => {
  const days = parseInt(req.query.days) || 84
  const heatmap = await dsaService.getHeatmap(req.user._id, days)
  res.json({
    success: true,
    message: 'Heatmap data retrieved',
    data: { heatmap },
  })
})

export const getStreak = asyncWrapper(async (req, res) => {
  const streak = await dsaService.getStreak(req.user._id)
  res.json({
    success: true,
    message: 'Streak retrieved',
    data: { streak },
  })
})

export const getWeakTopics = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5
  const weakTopics = await dsaService.getWeakTopics(req.user._id, limit)
  res.json({
    success: true,
    message: 'Weak topics retrieved',
    data: { topics: weakTopics },
  })
})

export const getStrongTopics = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5
  const strongTopics = await dsaService.getStrongTopics(req.user._id, limit)
  res.json({
    success: true,
    message: 'Strong topics retrieved',
    data: { topics: strongTopics },
  })
})

export const getCompanyReadiness = asyncWrapper(async (req, res) => {
  const { companyName } = req.query
  if (!companyName) {
    return res.status(400).json({
      success: false,
      message: 'Company name is required',
      data: null,
    })
  }
  const readiness = await dsaService.getCompanyReadiness(req.user._id, companyName)
  res.json({
    success: true,
    message: 'Company readiness retrieved',
    data: readiness,
  })
})

export const getRecommendedProblems = asyncWrapper(async (req, res) => {
  const { topics, limit } = req.query
  const weakTopicIds = topics ? topics.split(',') : []
  const problems = await dsaService.getRecommendedProblems(req.user._id, weakTopicIds, limit ? parseInt(limit) : 10)
  res.json({
    success: true,
    message: 'Recommended problems retrieved',
    data: { problems },
  })
})

// ── Dashboard ────────────────────────────────────────────────────────────

export const getDashboardStats = asyncWrapper(async (req, res) => {
  const stats = await dsaService.getStats(req.user._id)
  res.json({
    success: true,
    message: 'DSA dashboard stats retrieved',
    data: stats,
  })
})

export const getRevisionQueue = asyncWrapper(async (req, res) => {
  const queue = await dsaService.getRevisionQueue(req.user._id)
  res.json({
    success: true,
    message: 'Revision queue retrieved',
    data: { revisions: queue },
  })
})

export const getTrends = asyncWrapper(async (req, res) => {
  const months = parseInt(req.query.months) || 6
  const trends = await dsaService.getMonthlyTrends(req.user._id, months)
  res.json({
    success: true,
    message: 'Monthly trends retrieved',
    data: { trends },
  })
})
