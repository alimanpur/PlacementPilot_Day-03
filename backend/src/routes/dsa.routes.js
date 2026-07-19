import { Router } from 'express'
import {
  createTopic,
  getTopics,
  getTopic,
  updateTopic,
  deleteTopic,
  createProblem,
  getProblems,
  getProblem,
  updateProblem,
  deleteProblem,
  bulkUpdateProblems,
  toggleFavorite,
  toggleBookmark,
  toggleStar,
  getBookmarks,
  getFavorites,
  createSession,
  getSessions,
  getSession,
  updateSession,
  endSession,
  deleteSession,
  createRoadmap,
  getRoadmaps,
  getRoadmap,
  updateRoadmap,
  deleteRoadmap,
  completeRoadmapProblem,
  getRoadmapProgress,
  createRevision,
  getRevisions,
  getRevision,
  updateRevision,
  completeRevision,
  skipRevision,
  deleteRevision,
  getDailyRevisionQueue,
  getWeeklyRevisionQueue,
  getMissedRevisions,
  getInsights,
  getHeatmap,
  getStreak,
  getWeakTopics,
  getStrongTopics,
  getCompanyReadiness,
  getRecommendedProblems,
  getDashboardStats,
  getRevisionQueue,
  getTrends,
} from '../controllers/dsa.controller.js'
import { authenticate } from '../middlewares/auth.js'
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
  dsaProblemIdSchema,
} from '../validators/dsa.validator.js'

const router = Router()

router.use(authenticate)

// ── Topics ──────────────────────────────────────────────────────────────

router.post('/topics', validate(dsaTopicSchema), createTopic)
router.get('/topics', getTopics)
router.get('/topics/:id', validate(dsaIdSchema), getTopic)
router.put('/topics/:id', validate(dsaIdSchema), validate(dsaTopicSchema.partial()), updateTopic)
router.delete('/topics/:id', validate(dsaIdSchema), deleteTopic)

// ── Problems ────────────────────────────────────────────────────────────

router.post('/problems', validate(dsaProblemSchema), createProblem)
router.get('/problems', validate(dsaSearchSchema, { query: true }), getProblems)
router.get('/problems/bookmarks', getBookmarks)
router.get('/problems/favorites', getFavorites)
router.get('/problems/:id', validate(dsaIdSchema), getProblem)
router.put('/problems/:id', validate(dsaIdSchema), validate(dsaProblemSchema.partial()), updateProblem)
router.delete('/problems/:id', validate(dsaIdSchema), deleteProblem)
router.post('/problems/bulk', validate(dsaBulkActionSchema), bulkUpdateProblems)
router.patch('/problems/:id/favorite', validate(dsaIdSchema), toggleFavorite)
router.patch('/problems/:id/bookmark', validate(dsaIdSchema), toggleBookmark)
router.patch('/problems/:id/star', validate(dsaIdSchema), toggleStar)

// ── Sessions ────────────────────────────────────────────────────────────

router.post('/sessions', validate(dsaSessionSchema), createSession)
router.get('/sessions', getSessions)
router.get('/sessions/:id', validate(dsaIdSchema), getSession)
router.put('/sessions/:id', validate(dsaIdSchema), validate(dsaSessionSchema.partial()), updateSession)
router.post('/sessions/:id/end', validate(dsaIdSchema), endSession)
router.delete('/sessions/:id', validate(dsaIdSchema), deleteSession)

// ── Roadmaps ────────────────────────────────────────────────────────────

router.post('/roadmaps', validate(dsaRoadmapSchema), createRoadmap)
router.get('/roadmaps', getRoadmaps)
router.get('/roadmaps/:id', validate(dsaIdSchema), getRoadmap)
router.put('/roadmaps/:id', validate(dsaIdSchema), validate(dsaRoadmapSchema.partial()), updateRoadmap)
router.delete('/roadmaps/:id', validate(dsaIdSchema), deleteRoadmap)
router.post('/roadmaps/:id/complete-problem', validate(dsaIdSchema), validate(dsaProblemIdSchema), completeRoadmapProblem)
router.get('/roadmaps/:id/progress', validate(dsaIdSchema), getRoadmapProgress)

// ── Revisions ───────────────────────────────────────────────────────────

router.post('/revisions', validate(dsaRevisionSchema), createRevision)
router.get('/revisions', getRevisions)
router.get('/revisions/daily', getDailyRevisionQueue)
router.get('/revisions/weekly', getWeeklyRevisionQueue)
router.get('/revisions/missed', getMissedRevisions)
router.get('/revisions/:id', validate(dsaIdSchema), getRevision)
router.put('/revisions/:id', validate(dsaIdSchema), validate(dsaRevisionSchema.partial()), updateRevision)
router.post('/revisions/:id/complete', validate(dsaIdSchema), completeRevision)
router.post('/revisions/:id/skip', validate(dsaIdSchema), skipRevision)
router.delete('/revisions/:id', validate(dsaIdSchema), deleteRevision)

// ── Analytics ────────────────────────────────────────────────────────────

router.get('/insights', getInsights)
router.get('/analytics/heatmap', getHeatmap)
router.get('/analytics/streak', getStreak)
router.get('/analytics/weak-topics', getWeakTopics)
router.get('/analytics/strong-topics', getStrongTopics)
router.get('/analytics/company-readiness', getCompanyReadiness)
router.get('/analytics/recommended', getRecommendedProblems)
router.get('/analytics/trends', getTrends)

// ── Dashboard ────────────────────────────────────────────────────────────

router.get('/stats', getDashboardStats)
router.get('/dashboard/stats', getDashboardStats)
router.get('/dashboard/revision-queue', getRevisionQueue)

export { router as dsaRouter }
