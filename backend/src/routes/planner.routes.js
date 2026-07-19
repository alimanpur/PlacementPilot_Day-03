import { Router } from 'express'
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  markTaskComplete,
  bulkUpdateTasks,
  getCalendarEvents,
  checkConflict,
  getDailyPlanner,
  getTodayFocus,
  generateSmartTasks,
  getSmartTasks,
  syncAll,
  createHabit,
  getHabits,
  getHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  markGoalComplete,
  getAnalytics,
  getStats,

} from '../controllers/planner.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import {
  plannerTaskSchema,
  plannerHabitSchema,
  plannerGoalSchema,
  plannerSearchSchema,
  plannerIdSchema,
  plannerBulkActionSchema,
} from '../validators/planner.validator.js'

const router = Router()

router.use(authenticate)

// ── Tasks ──────────────────────────────────────────────────────────────

router.post('/tasks', validate(plannerTaskSchema), createTask)
router.get('/tasks', validate(plannerSearchSchema, { query: true }), getTasks)
router.get('/tasks/:id', validate(plannerIdSchema), getTask)
router.put('/tasks/:id', validate(plannerIdSchema), validate(plannerTaskSchema.partial()), updateTask)
router.delete('/tasks/:id', validate(plannerIdSchema), deleteTask)
router.post('/tasks/:id/complete', validate(plannerIdSchema), markTaskComplete)
router.post('/tasks/bulk', validate(plannerBulkActionSchema), bulkUpdateTasks)

// ── Calendar ────────────────────────────────────────────────────────────

router.get('/calendar', getCalendarEvents)
router.get('/calendar/check-conflict', checkConflict)

// ── Daily Planner ───────────────────────────────────────────────────────

router.get('/daily', getDailyPlanner)
router.get('/today-focus', getTodayFocus)

// ── Smart Tasks ─────────────────────────────────────────────────────────

router.post('/smart-tasks/generate', generateSmartTasks)
router.get('/smart-tasks', getSmartTasks)
router.post('/sync-all', syncAll)

// ── Habits ──────────────────────────────────────────────────────────────

router.post('/habits', validate(plannerHabitSchema), createHabit)
router.get('/habits', getHabits)
router.get('/habits/:id', validate(plannerIdSchema), getHabit)
router.put('/habits/:id', validate(plannerIdSchema), validate(plannerHabitSchema.partial()), updateHabit)
router.delete('/habits/:id', validate(plannerIdSchema), deleteHabit)
router.post('/habits/:id/complete', validate(plannerIdSchema), completeHabit)

// ── Goals ───────────────────────────────────────────────────────────────

router.post('/goals', validate(plannerGoalSchema), createGoal)
router.get('/goals', getGoals)
router.get('/goals/:id', validate(plannerIdSchema), getGoal)
router.put('/goals/:id', validate(plannerIdSchema), validate(plannerGoalSchema.partial()), updateGoal)
router.delete('/goals/:id', validate(plannerIdSchema), deleteGoal)
router.post('/goals/:id/complete', validate(plannerIdSchema), markGoalComplete)

// ── Analytics ────────────────────────────────────────────────────────────

router.get('/analytics', getAnalytics)
router.get('/stats', getStats)

export { router as plannerRouter }


