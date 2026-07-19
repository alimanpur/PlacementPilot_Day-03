import mongoose from 'mongoose'
import { PlannerTask, PlannerHabit } from '../models/planner.model.js'
import { Goal } from '../models/goal.model.js'
import { Interview } from '../models/interview.model.js'
import { Company } from '../models/company.model.js'
import { DSARevision, DSAProblem } from '../models/dsa.model.js'
import { safeArray, safeObject, safeNumber } from '../lib/safeData.js'

export class PlannerRepository {
  // ── Tasks ──────────────────────────────────────────────────────────────

  async createTask(userId, data) {
    return PlannerTask.create({ ...data, userId })
  }

  async findTaskById(userId, id) {
    return PlannerTask.findOne({ _id: id, userId, deletedAt: null })
  }

  async findTasks(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      category,
      priority,
      linkedModule,
      linkedId,
      tags,
      search,
      startDate,
      endDate,
      overdue,
    } = options

    const query = { userId, deletedAt: null }

    if (status) query.status = status
    if (category) query.category = category
    if (priority) query.priority = priority
    if (linkedModule) query.linkedModule = linkedModule
    if (linkedId) query.linkedId = linkedId
    if (tags) query.tags = { $in: tags.split(',').map((t) => t.trim()) }
    if (overdue === true || overdue === 'true') {
      query.status = { $nin: ['completed', 'cancelled'] }
      query.deadline = { $lt: new Date() }
    }
    if (startDate || endDate) {
      query.startDate = {}
      if (startDate) query.startDate.$gte = new Date(startDate)
      if (endDate) query.startDate.$lte = new Date(endDate)
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ]
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
    const skip = (page - 1) * limit

    const [tasks, total] = await Promise.all([
      PlannerTask.find(query).sort(sort).skip(skip).limit(limit).lean(),
      PlannerTask.countDocuments(query),
    ])

    return { tasks: safeArray(tasks), total: safeNumber(total), page: Number(page), limit: Number(limit), totalPages: Math.ceil(safeNumber(total) / limit) }
  }

  async updateTask(userId, id, data) {
    return PlannerTask.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      data,
      { new: true, runValidators: true },
    )
  }

  async deleteTask(userId, id) {
    return PlannerTask.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    )
  }

  async markTaskComplete(userId, id) {
    return PlannerTask.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { status: 'completed', completedDate: new Date() },
      { new: true },
    )
  }

  async bulkUpdateTasks(userId, ids, data) {
    return PlannerTask.updateMany(
      { _id: { $in: ids }, userId, deletedAt: null },
      { $set: data },
    )
  }

  async bulkDeleteTasks(userId, ids) {
    return PlannerTask.updateMany(
      { _id: { $in: ids }, userId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
    )
  }

  async findByDate(userId, date) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    return safeArray(await PlannerTask.find({
      userId,
      deletedAt: null,
      archived: false,
      $or: [
        { startDate: { $gte: start, $lte: end } },
        { dueDate: { $gte: start, $lte: end } },
        { deadline: { $gte: start, $lte: end } },
      ],
    }).sort({ priority: -1, createdAt: 1 }))
  }

  async findByWeek(userId, startDate, endDate) {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    return safeArray(await PlannerTask.find({
      userId,
      deletedAt: null,
      archived: false,
      $or: [
        { startDate: { $gte: start, $lte: end } },
        { dueDate: { $gte: start, $lte: end } },
        { deadline: { $gte: start, $lte: end } },
      ],
    }).sort({ startDate: 1, priority: -1 }))
  }

  async findUpcoming(userId, limit = 10) {
    const now = new Date()
    return safeArray(await PlannerTask.find({
      userId,
      deletedAt: null,
      archived: false,
      status: { $nin: ['completed', 'cancelled'] },
      dueDate: { $gte: now },
    })
      .sort({ dueDate: 1, priority: -1 })
      .limit(limit))
  }

  async findOverdue(userId) {
    const now = new Date()
    return safeArray(await PlannerTask.find({
      userId,
      deletedAt: null,
      archived: false,
      status: { $nin: ['completed', 'cancelled'] },
      dueDate: { $lt: now },
    }).sort({ dueDate: 1, priority: -1 }))
  }

  async findTodayCompleted(userId) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return safeArray(await PlannerTask.find({
      userId,
      deletedAt: null,
      status: 'completed',
      completedDate: { $gte: today, $lt: tomorrow },
    }))
  }

  // ── Smart Tasks ────────────────────────────────────────────────────────

  async createSmartTaskFromInterview(userId, interviewId) {
    const interview = await Interview.findById(interviewId)
    if (!interview) return null

    const tasks = []
    const baseData = {
      userId,
      linkedModule: 'interview',
      linkedId: interview._id,
      linkedType: 'interview',
      category: 'interview_prep',
    }

    const taskTemplates = [
      { title: `Prepare resume for ${interview.company}`, priority: 'high', estimatedTime: 60 },
      { title: `Review ${interview.company} company profile`, priority: 'medium', estimatedTime: 30 },
      { title: `Practice DSA topics for ${interview.type.replace(/_/g, ' ')}`, priority: 'high', estimatedTime: 120 },
      { title: `Review behavioral questions`, priority: 'medium', estimatedTime: 45 },
      { title: `Prepare questions for ${interview.company}`, priority: 'medium', estimatedTime: 30 },
    ]

    for (const template of taskTemplates) {
      const task = await this.createTask(userId, {
        ...baseData,
        ...template,
        deadline: new Date(interview.scheduledDate),
      })
      tasks.push(task)
    }

    return tasks
  }

  async createSmartTaskFromApplication(userId, applicationId) {
    const application = await Company.findById(applicationId)
    if (!application) return null

    const task = await this.createTask(userId, {
      userId,
      linkedModule: 'application',
      linkedId: application._id,
      linkedType: 'application',
      title: `Follow up on ${application.name} application`,
      description: `Application status: ${application.status}`,
      category: 'applications',
      priority: 'medium',
      deadline: application.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return task
  }

  async createSmartTaskFromDSARevision(userId, revisionId) {
    const revision = await DSARevision.findById(revisionId)
    if (!revision) return null

    const task = await this.createTask(userId, {
      userId,
      linkedModule: 'dsa',
      linkedId: revision._id,
      linkedType: 'dsa_revision',
      title: `Revise: ${revision.problemTitle}`,
      description: `Topic: ${revision.problemTopic} | Difficulty: ${revision.problemDifficulty}`,
      category: 'revision',
      priority: 'high',
      deadline: revision.dueDate,
    })

    return task
  }

  async createSmartTaskFromDSAWeakTopic(userId, topic, mastery) {
    const task = await this.createTask(userId, {
      userId,
      linkedModule: 'dsa',
      linkedType: 'dsa_problem',
      title: `Practice ${topic} problems`,
      description: `Mastery is at ${mastery}%. Improve with focused practice.`,
      category: 'dsa',
      priority: 'high',
      estimatedTime: 60,
    })

    return task
  }

  async findSmartTasks(userId) {
    return safeArray(await PlannerTask.find({
      userId,
      deletedAt: null,
      linkedModule: { $ne: 'none' },
    }).sort({ createdAt: -1 }))
  }

  // ── Calendar ───────────────────────────────────────────────────────────

  async getCalendarEvents(userId, startDate, endDate) {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const tasks = await PlannerTask.find({
      userId,
      deletedAt: null,
      archived: false,
      $or: [
        { startDate: { $gte: start, $lte: end } },
        { dueDate: { $gte: start, $lte: end } },
        { deadline: { $gte: start, $lte: end } },
      ],
    }).sort({ startDate: 1, priority: -1 })

    return safeArray(tasks).map((task) => ({
      id: task._id,
      title: task.title,
      start: task.startDate || task.dueDate || task.deadline,
      end: task.deadline,
      allDay: !task.startDate,
      priority: task.priority,
      status: task.status,
      category: task.category,
      color: task.color,
    }))
  }

  async checkSchedulingConflict(userId, date, durationMinutes = 60) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    const tasks = await PlannerTask.find({
      userId,
      deletedAt: null,
      archived: false,
      status: { $nin: ['completed', 'cancelled'] },
      $or: [
        { startDate: { $gte: start, $lte: end } },
        { dueDate: { $gte: start, $lte: end } },
      ],
    })

    const totalScheduled = tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0)
    return totalScheduled + durationMinutes > 480
  }

  // ── Daily Planner ──────────────────────────────────────────────────────

  async getDailyPlanner(userId, date) {
    const today = new Date(date)
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [tasks, completedToday, upcomingDeadlines, interviewPrep, revisionQueue, overdue] = await Promise.all([
      this.findByDate(userId, today),
      this.findTodayCompleted(userId),
      this.findUpcoming(userId, 5),
      this.findTasks(userId, { category: 'interview_prep', status: 'pending', limit: 5 }),
      this.findTasks(userId, { category: 'revision', status: 'pending', limit: 5 }),
      this.findOverdue(userId),
    ])

    return {
      tasks,
      completedToday: completedToday.length,
      upcomingDeadlines,
      interviewPrep,
      revisionQueue,
      overdue,
    }
  }

  // ── Analytics ──────────────────────────────────────────────────────────

  async getTaskCompletionRate(userId, days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const [total, completed] = await Promise.all([
      PlannerTask.countDocuments({
        userId,
        deletedAt: null,
        createdAt: { $gte: startDate },
      }),
      PlannerTask.countDocuments({
        userId,
        deletedAt: null,
        status: 'completed',
        completedDate: { $gte: startDate },
      }),
    ])

    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  async getProductivityTrends(userId, weeks = 12) {
    const data = []
    const now = new Date()

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - (i * 7))
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)

      const [completed, created] = await Promise.all([
        PlannerTask.countDocuments({
          userId,
          deletedAt: null,
          status: 'completed',
          completedDate: { $gte: weekStart, $lt: weekEnd },
        }),
        PlannerTask.countDocuments({
          userId,
          deletedAt: null,
          createdAt: { $gte: weekStart, $lt: weekEnd },
        }),
      ])

      data.push({
        week: weeks - i,
        completed: safeNumber(completed),
        created: safeNumber(created),
        rate: created > 0 ? Math.round((completed / created) * 100) : 0,
      })
    }

    return safeArray(data)
  }

  async getCategoryDistribution(userId) {
    return safeArray(await PlannerTask.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
    ]))
  }

  async getWeeklyReport(userId) {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const [tasks, completed, byCategory, byPriority] = await Promise.all([
      PlannerTask.find({
        userId,
        deletedAt: null,
        createdAt: { $gte: weekStart, $lt: weekEnd },
      }),
      PlannerTask.countDocuments({
        userId,
        deletedAt: null,
        status: 'completed',
        completedDate: { $gte: weekStart, $lt: weekEnd },
      }),
      this.getCategoryDistribution(userId),
      PlannerTask.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null, createdAt: { $gte: weekStart, $lt: weekEnd } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ])

    const tasksArr = safeArray(tasks)
    const total = tasksArr.length
    const totalTime = tasksArr.reduce((sum, t) => sum + (t.actualTime || t.estimatedTime || 0), 0)

    return {
      total,
      completed: safeNumber(completed),
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalTime,
      byCategory: safeArray(byCategory),
      byPriority: safeArray(byPriority),
    }
  }

  // ── Habits ─────────────────────────────────────────────────────────────

  async createHabit(userId, data) {
    return PlannerHabit.create({ ...data, userId })
  }

  async findHabits(userId) {
    return safeArray(await PlannerHabit.find({ userId, deletedAt: null, active: true }).sort({ createdAt: -1 }))
  }

  async findHabitById(userId, id) {
    return PlannerHabit.findOne({ _id: id, userId, deletedAt: null })
  }

  async updateHabit(userId, id, data) {
    return PlannerHabit.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      data,
      { new: true, runValidators: true },
    )
  }

  async deleteHabit(userId, id) {
    return PlannerHabit.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    )
  }

  async completeHabit(userId, id, date, value = 1) {
    const habit = await this.findHabitById(userId, id)
    if (!habit) return null

    const dateStr = new Date(date).toDateString()
    const existingIndex = habit.completedDates.findIndex((d) => new Date(d.date).toDateString() === dateStr)

    if (existingIndex >= 0) {
      habit.completedDates[existingIndex].value += value
    } else {
      habit.completedDates.push({ date: new Date(date), value })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const streak = this._calculateStreak(habit.completedDates)
    const bestStreak = Math.max(habit.bestStreak, streak)

    const totalPossible = this._calculateTotalPossible(habit)
    const completionRate = totalPossible > 0 ? Math.round((habit.completedDates.length / totalPossible) * 100) : 0

    return PlannerHabit.findByIdAndUpdate(
      id,
      {
        completedDates: habit.completedDates,
        streak,
        bestStreak,
        completionRate,
      },
      { new: true },
    )
  }

  _calculateStreak(completedDates) {
    if (!completedDates.length) return 0

    const dates = [...new Set(completedDates.map((d) => new Date(d.date).toDateString()))].sort((a, b) => new Date(b) - new Date(a))
    let streak = 0
    const checkDate = new Date()
    checkDate.setHours(0, 0, 0, 0)

    for (const dateStr of dates) {
      const date = new Date(dateStr)
      date.setHours(0, 0, 0, 0)
      const diffDays = (checkDate - date) / (1000 * 60 * 60 * 24)

      if (diffDays === streak || (streak === 0 && diffDays === 0)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (diffDays === streak + 1) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  _calculateTotalPossible(habit) {
    if (habit.frequency === 'daily') {
      return Math.max(habit.completedDates.length, 30)
    }
    if (habit.frequency === 'weekly') {
      return Math.max(Math.floor(habit.completedDates.length / 7), 12)
    }
    return habit.completedDates.length
  }

  // ── Goals ──────────────────────────────────────────────────────────────

  async createGoal(userId, data) {
    return Goal.create({ ...data, userId })
  }

  async findGoals(userId, filters = {}) {
    return safeArray(await Goal.find({ userId, deletedAt: null, ...filters }).sort({ deadline: 1 }))
  }

  async findGoalById(userId, id) {
    return Goal.findOne({ _id: id, userId, deletedAt: null })
  }

  async updateGoal(userId, id, data) {
    return Goal.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      data,
      { new: true, runValidators: true },
    )
  }

  async deleteGoal(userId, id) {
    return Goal.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    )
  }

  async markGoalComplete(userId, id) {
    return Goal.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { progress: 100, status: 'completed', completedAt: new Date() },
      { new: true },
    )
  }

  // ── Dashboard ──────────────────────────────────────────────────────────

  async getDashboardStats(userId) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [
      totalTasks,
      completedToday,
      overdueCount,
      upcomingCount,
      activeHabits,
      activeGoals,
      weeklyCompletion,
      categoryDistribution,
    ] = await Promise.all([
      PlannerTask.countDocuments({ userId, deletedAt: null }),
      PlannerTask.countDocuments({
        userId,
        deletedAt: null,
        status: 'completed',
        completedDate: { $gte: today, $lt: tomorrow },
      }),
      this.findOverdue(userId),
      this.findUpcoming(userId, 10),
      PlannerHabit.countDocuments({ userId, deletedAt: null, active: true }),
      Goal.countDocuments({ userId, deletedAt: null, status: 'active' }),
      this.getTaskCompletionRate(userId, 7),
      this.getCategoryDistribution(userId),
    ])

    return {
      totalTasks: safeNumber(totalTasks),
      completedToday: safeNumber(completedToday),
      overdueCount: safeArray(overdueCount).length,
      upcomingCount: safeArray(upcomingCount).length,
      activeHabits: safeNumber(activeHabits),
      activeGoals: safeNumber(activeGoals),
      weeklyCompletion: safeNumber(weeklyCompletion),
      categoryDistribution: safeArray(categoryDistribution),
    }
  }

  async findRecent(userId, limit = 10) {
    return safeArray(await PlannerTask.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean())
  }

  async getWeeklyTarget(userId, startDate, endDate) {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const results = await PlannerTask.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          $or: [
            { startDate: { $gte: start, $lte: end } },
            { dueDate: { $gte: start, $lte: end } },
            { deadline: { $gte: start, $lte: end } },
          ],
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
    ])

    const result = results[0] || {}
    return {
      total: safeNumber(result.total),
      completed: safeNumber(result.completed),
      completionRate: result.total > 0 ? Math.round((result.completed / result.total) * 100) : 0,
    }
  }
}
