import { PlannerService } from '../services/planner.service.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'
import { validate } from '../middlewares/validate.js'
import {
  plannerTaskSchema,
  plannerHabitSchema,
  plannerGoalSchema,
  plannerSearchSchema,
  plannerIdSchema,
  plannerBulkActionSchema,
} from '../validators/planner.validator.js'

const plannerService = new PlannerService()

// ── Tasks ──────────────────────────────────────────────────────────────

export const createTask = asyncWrapper(async (req, res) => {
  const task = await plannerService.createTask(req.user._id, req.body)
  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task },
  })
})

export const getTasks = asyncWrapper(async (req, res) => {
  const options = {
    ...req.query,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
  }
  const result = await plannerService.getTasks(req.user._id, options)
  res.json({
    success: true,
    message: 'Tasks retrieved',
    data: result,
  })
})

export const getTask = asyncWrapper(async (req, res) => {
  const task = await plannerService.getTask(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Task retrieved',
    data: { task },
  })
})

export const updateTask = asyncWrapper(async (req, res) => {
  const task = await plannerService.updateTask(req.user._id, req.params.id, req.body)
  res.json({
    success: true,
    message: 'Task updated successfully',
    data: { task },
  })
})

export const deleteTask = asyncWrapper(async (req, res) => {
  const task = await plannerService.deleteTask(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Task deleted successfully',
    data: null,
  })
})

export const markTaskComplete = asyncWrapper(async (req, res) => {
  const task = await plannerService.markTaskComplete(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Task marked complete',
    data: { task },
  })
})

export const bulkUpdateTasks = asyncWrapper(async (req, res) => {
  const { ids, action, data } = req.body
  let result
  switch (action) {
    case 'delete':
      result = await plannerService.bulkDeleteTasks(req.user._id, ids)
      break
    case 'complete':
      result = await plannerService.bulkUpdateTasks(req.user._id, ids, { status: 'completed', completedDate: new Date() })
      break
    default:
      result = await plannerService.bulkUpdateTasks(req.user._id, ids, data)
  }
  res.json({
    success: true,
    message: `Bulk ${action} completed`,
    data: result,
  })
})

// ── Calendar ────────────────────────────────────────────────────────────

export const getCalendarEvents = asyncWrapper(async (req, res) => {
  const { startDate, endDate } = req.query
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'startDate and endDate are required',
      data: null,
    })
  }
  const events = await plannerService.getCalendarEvents(req.user._id, startDate, endDate)
  res.json({
    success: true,
    message: 'Calendar events retrieved',
    data: { events },
  })
})

export const checkConflict = asyncWrapper(async (req, res) => {
  const { date, duration } = req.query
  const conflict = await plannerService.checkConflict(req.user._id, date, duration ? parseInt(duration) : 60)
  res.json({
    success: true,
    message: 'Conflict check completed',
    data: { conflict },
  })
})

// ── Daily Planner ───────────────────────────────────────────────────────

export const getDailyPlanner = asyncWrapper(async (req, res) => {
  const { date } = req.query
  const planner = await plannerService.getDailyPlanner(req.user._id, date || new Date())
  res.json({
    success: true,
    message: 'Daily planner retrieved',
    data: planner,
  })
})

export const getTodayFocus = asyncWrapper(async (req, res) => {
  const focus = await plannerService.getTodayFocus(req.user._id)
  res.json({
    success: true,
    message: 'Today\'s focus retrieved',
    data: focus,
  })
})

// ── Smart Tasks ─────────────────────────────────────────────────────────

export const generateSmartTasks = asyncWrapper(async (req, res) => {
  const tasks = await plannerService.generateSmartTasks(req.user._id)
  res.json({
    success: true,
    message: 'Smart tasks generated',
    data: { tasks },
  })
})

export const getSmartTasks = asyncWrapper(async (req, res) => {
  const tasks = await plannerService.getSmartTasks(req.user._id)
  res.json({
    success: true,
    message: 'Smart tasks retrieved',
    data: { tasks },
  })
})

export const syncAll = asyncWrapper(async (req, res) => {
  const result = await plannerService.syncAll(req.user._id)
  res.json({
    success: true,
    message: 'All modules synced',
    data: result,
  })
})

// ── Habits ──────────────────────────────────────────────────────────────

export const createHabit = asyncWrapper(async (req, res) => {
  const habit = await plannerService.createHabit(req.user._id, req.body)
  res.status(201).json({
    success: true,
    message: 'Habit created successfully',
    data: { habit },
  })
})

export const getHabits = asyncWrapper(async (req, res) => {
  const habits = await plannerService.getHabits(req.user._id)
  res.json({
    success: true,
    message: 'Habits retrieved',
    data: { habits },
  })
})

export const getHabit = asyncWrapper(async (req, res) => {
  const habit = await plannerService.getHabit(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Habit retrieved',
    data: { habit },
  })
})

export const updateHabit = asyncWrapper(async (req, res) => {
  const habit = await plannerService.updateHabit(req.user._id, req.params.id, req.body)
  res.json({
    success: true,
    message: 'Habit updated successfully',
    data: { habit },
  })
})

export const deleteHabit = asyncWrapper(async (req, res) => {
  const habit = await plannerService.deleteHabit(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Habit deleted successfully',
    data: null,
  })
})

export const completeHabit = asyncWrapper(async (req, res) => {
  const { date, value } = req.body
  const habit = await plannerService.completeHabit(req.user._id, req.params.id, date || new Date(), value || 1)
  res.json({
    success: true,
    message: 'Habit completed',
    data: { habit },
  })
})

// ── Goals ───────────────────────────────────────────────────────────────

export const createGoal = asyncWrapper(async (req, res) => {
  const goal = await plannerService.createGoal(req.user._id, req.body)
  res.status(201).json({
    success: true,
    message: 'Goal created successfully',
    data: { goal },
  })
})

export const getGoals = asyncWrapper(async (req, res) => {
  const goals = await plannerService.getGoals(req.user._id)
  res.json({
    success: true,
    message: 'Goals retrieved',
    data: { goals },
  })
})

export const getGoal = asyncWrapper(async (req, res) => {
  const goal = await plannerService.getGoal(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Goal retrieved',
    data: { goal },
  })
})

export const updateGoal = asyncWrapper(async (req, res) => {
  const goal = await plannerService.updateGoal(req.user._id, req.params.id, req.body)
  res.json({
    success: true,
    message: 'Goal updated successfully',
    data: { goal },
  })
})

export const deleteGoal = asyncWrapper(async (req, res) => {
  const goal = await plannerService.deleteGoal(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Goal deleted successfully',
    data: null,
  })
})

export const markGoalComplete = asyncWrapper(async (req, res) => {
  const goal = await plannerService.markGoalComplete(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Goal marked complete',
    data: { goal },
  })
})

// ── Analytics ────────────────────────────────────────────────────────────

export const getAnalytics = asyncWrapper(async (req, res) => {
  const analytics = await plannerService.getAnalytics(req.user._id)
  res.json({
    success: true,
    message: 'Planner analytics retrieved',
    data: analytics,
  })
})

export const getStats = asyncWrapper(async (req, res) => {
  const stats = await plannerService.getStats(req.user._id)
  res.json({
    success: true,
    message: 'Planner stats retrieved',
    data: stats,
  })
})

// ── Legacy Endpoints (Backward Compatibility) ────────────────────────────

export const getWeekTasks = asyncWrapper(async (req, res) => {
  const { start, end } = req.query
  const tasks = await plannerService.repository.findByWeek(
    req.user._id,
    start ? new Date(start) : new Date(),
    end ? new Date(end) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  )
  res.json({
    success: true,
    message: 'Week tasks retrieved',
    data: { tasks },
  })
})

export const getTodayTasks = asyncWrapper(async (req, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tasks = await plannerService.repository.findByDate(req.user._id, today)
  res.json({
    success: true,
    message: 'Today tasks retrieved',
    data: { tasks },
  })
})

export const getWeeklyTarget = asyncWrapper(async (req, res) => {
  const start = new Date()
  start.setDate(start.getDate() - start.getDay() + 1)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  const stats = await plannerService.repository.getWeeklyTarget(req.user._id, start, end)
  const { total = 0, completed = 0 } = stats[0] || {}

  res.json({
    success: true,
    message: 'Weekly target retrieved',
    data: {
      target: total || 40,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    },
  })
})
