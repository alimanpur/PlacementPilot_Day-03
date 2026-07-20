import mongoose from 'mongoose'
import { PlannerRepository } from '../repositories/planner.repository.js'
import { InterviewRepository } from '../repositories/interview.repository.js'
import { CompanyRepository } from '../repositories/company.repository.js'
import { DSARevision, DSAProblem, DSATopic } from '../models/dsa.model.js'
import { Goal } from '../models/goal.model.js'
import { NotificationService } from './notification.service.js'
import { AnalyticsService } from './analytics.service.js'
import { PlannerTask } from '../models/planner.model.js'

export class PlannerService {
  constructor() {
    this.repository = new PlannerRepository()
    this.interviewRepo = new InterviewRepository()
    this.companyRepo = new CompanyRepository()
    this.notificationService = new NotificationService()
    this.analyticsService = new AnalyticsService()
  }

  // ── Tasks ──────────────────────────────────────────────────────────────

  async createTask(userId, data) {
    const task = await this.repository.createTask(userId, {
      ...data,
      status: data.status || 'pending',
    })
    return task
  }

  async getTasks(userId, options = {}) {
    return this.repository.findTasks(userId, options)
  }

  async getTask(userId, id) {
    const task = await this.repository.findTaskById(userId, id)
    if (!task) throw new Error('Task not found')
    return task
  }

  async updateTask(userId, id, data) {
    const task = await this.repository.updateTask(userId, id, data)
    if (!task) throw new Error('Task not found')
    return task
  }

  async deleteTask(userId, id) {
    const task = await this.repository.deleteTask(userId, id)
    if (!task) throw new Error('Task not found')
    return task
  }

  async markTaskComplete(userId, id) {
    const task = await this.repository.markTaskComplete(userId, id)
    if (!task) throw new Error('Task not found')
    return task
  }

  async bulkUpdateTasks(userId, ids, data) {
    if (!ids.length) throw new Error('No task IDs provided')
    const result = await this.repository.bulkUpdateTasks(userId, ids, data)
    return { modified: result.modifiedCount }
  }

  async bulkDeleteTasks(userId, ids) {
    if (!ids.length) throw new Error('No task IDs provided')
    const result = await this.repository.bulkDeleteTasks(userId, ids)
    return { deleted: result.modifiedCount }
  }

  // ── Smart Tasks ────────────────────────────────────────────────────────

  async generateSmartTasks(userId) {
    const tasks = []

    const upcomingInterviews = await this.interviewRepo.getUpcomingInterviews(userId, 5)
    for (const interview of upcomingInterviews) {
      const existing = await PlannerTask.findOne({
        userId,
        linkedModule: 'interview',
        linkedId: interview._id,
        deletedAt: null,
      })
      if (!existing) {
        const smartTasks = await this.repository.createSmartTaskFromInterview(userId, interview._id)
        tasks.push(...smartTasks)
      }
    }

    const overdueRevisions = await DSARevision.find({
      userId,
      deletedAt: null,
      dueDate: { $lt: new Date() },
      status: 'pending',
    }).limit(5)

    for (const revision of overdueRevisions) {
      const existing = await PlannerTask.findOne({
        userId,
        linkedModule: 'dsa',
        linkedId: revision._id,
        linkedType: 'dsa_revision',
        deletedAt: null,
      })
      if (!existing) {
        const task = await this.repository.createSmartTaskFromDSARevision(userId, revision._id)
        if (task) tasks.push(task)
      }
    }

    const weakTopics = await DSATopic.find({ userId, deletedAt: null })
      .sort({ mastery: 1 })
      .limit(3)

    for (const topic of weakTopics) {
      const existing = await PlannerTask.findOne({
        userId,
        linkedModule: 'dsa',
        linkedType: 'dsa_problem',
        title: { $regex: topic.topic, $options: 'i' },
        deletedAt: null,
      })
      if (!existing) {
        const task = await this.repository.createSmartTaskFromDSAWeakTopic(userId, topic.topic, topic.mastery)
        if (task) tasks.push(task)
      }
    }

    const upcomingApplications = await this.companyRepo.findUpcomingFollowUps(userId, 5)
    for (const app of upcomingApplications) {
      const existing = await PlannerTask.findOne({
        userId,
        linkedModule: 'application',
        linkedId: app._id,
        deletedAt: null,
      })
      if (!existing) {
        const task = await this.repository.createSmartTaskFromApplication(userId, app._id)
        if (task) tasks.push(task)
      }
    }

    return tasks
  }

  async getSmartTasks(userId) {
    return this.repository.findSmartTasks(userId)
  }

  // ── Calendar ───────────────────────────────────────────────────────────

  async getCalendarEvents(userId, startDate, endDate) {
    return this.repository.getCalendarEvents(userId, startDate, endDate)
  }

  async checkConflict(userId, date, durationMinutes = 60) {
    return this.repository.checkSchedulingConflict(userId, date, durationMinutes)
  }

  // ── Daily Planner ──────────────────────────────────────────────────────

  async getDailyPlanner(userId, date) {
    return this.repository.getDailyPlanner(userId, date)
  }

  async getTodayFocus(userId) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [tasks, overdue, upcomingDeadlines, interviewPrep, revisionQueue] = await Promise.all([
      this.repository.findByDate(userId, today),
      this.repository.findOverdue(userId),
      this.repository.findUpcoming(userId, 5),
      this.repository.findTasks(userId, { category: 'interview_prep', status: 'pending', limit: 5 }),
      this.repository.findTasks(userId, { category: 'revision', status: 'pending', limit: 5 }),
    ])

    const priorityQueue = tasks
      .filter((t) => t.status !== 'completed')
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })

    return {
      tasks,
      completedToday: tasks.filter((t) => t.status === 'completed').length,
      totalTasks: tasks.length,
      priorityQueue,
      upcomingDeadlines,
      interviewPrep,
      revisionQueue,
      overdue,
    }
  }

  // ── Goals ──────────────────────────────────────────────────────────────

  async createGoal(userId, data) {
    const goal = await this.repository.createGoal(userId, data)
    return goal
  }

  async getGoals(userId, filters = {}) {
    return this.repository.findGoals(userId, filters)
  }

  async getGoal(userId, id) {
    const goal = await this.repository.findGoalById(userId, id)
    if (!goal) throw new Error('Goal not found')
    return goal
  }

  async updateGoal(userId, id, data) {
    const goal = await this.repository.updateGoal(userId, id, data)
    if (!goal) throw new Error('Goal not found')
    return goal
  }

  async deleteGoal(userId, id) {
    const goal = await this.repository.deleteGoal(userId, id)
    if (!goal) throw new Error('Goal not found')
    return goal
  }

  async markGoalComplete(userId, id) {
    const goal = await this.repository.markGoalComplete(userId, id)
    if (!goal) throw new Error('Goal not found')
    return goal
  }

  // ── Habits ─────────────────────────────────────────────────────────────

  async createHabit(userId, data) {
    const habit = await this.repository.createHabit(userId, data)
    return habit
  }

  async getHabits(userId) {
    return this.repository.findHabits(userId)
  }

  async getHabit(userId, id) {
    const habit = await this.repository.findHabitById(userId, id)
    if (!habit) throw new Error('Habit not found')
    return habit
  }

  async updateHabit(userId, id, data) {
    const habit = await this.repository.updateHabit(userId, id, data)
    if (!habit) throw new Error('Habit not found')
    return habit
  }

  async deleteHabit(userId, id) {
    const habit = await this.repository.deleteHabit(userId, id)
    if (!habit) throw new Error('Habit not found')
    return habit
  }

  async completeHabit(userId, id, date, value = 1) {
    const habit = await this.repository.completeHabit(userId, id, date, value)
    if (!habit) throw new Error('Habit not found')
    return habit
  }

  async findRecent(userId, limit = 10) {
    return this.repository.findRecent(userId, limit)
  }

  // ── Analytics ──────────────────────────────────────────────────────────

  async getAnalytics(userId) {
    const [
      completionRate,
      productivityTrends,
      categoryDistribution,
      weeklyReport,
    ] = await Promise.all([
      this.repository.getTaskCompletionRate(userId, 30),
      this.repository.getProductivityTrends(userId, 12),
      this.repository.getCategoryDistribution(userId),
      this.repository.getWeeklyReport(userId),
    ])

    return {
      completionRate,
      productivityTrends,
      categoryDistribution,
      weeklyReport,
    }
  }

  async getStats(userId) {
    return this.repository.getDashboardStats(userId)
  }

  // ── Integrations ───────────────────────────────────────────────────────

  async syncWithInterviews(userId) {
    const upcomingInterviews = await this.interviewRepo.getUpcomingInterviews(userId, 10)
    const tasks = []

    for (const interview of upcomingInterviews) {
      const existing = await PlannerTask.findOne({
        userId,
        linkedModule: 'interview',
        linkedId: interview._id,
        deletedAt: null,
      })

      if (!existing) {
        const smartTasks = await this.repository.createSmartTaskFromInterview(userId, interview._id)
        tasks.push(...smartTasks)
      }
    }

    return tasks
  }

  async syncWithDSA(userId) {
    const weakTopics = await DSATopic.find({ userId, deletedAt: null })
      .sort({ mastery: 1 })
      .limit(3)

    const tasks = []
    for (const topic of weakTopics) {
      const existing = await PlannerTask.findOne({
        userId,
        linkedModule: 'dsa',
        linkedType: 'dsa_problem',
        title: { $regex: topic.topic, $options: 'i' },
        deletedAt: null,
      })
      if (!existing) {
        const task = await this.repository.createSmartTaskFromDSAWeakTopic(userId, topic.topic, topic.mastery)
        if (task) tasks.push(task)
      }
    }

    return tasks
  }

  async syncWithApplications(userId) {
    const companies = await this.companyRepo.findUpcomingFollowUps(userId, 10)
    const tasks = []

    for (const company of companies) {
      const existing = await PlannerTask.findOne({
        userId,
        linkedModule: 'application',
        linkedId: company._id,
        deletedAt: null,
      })
      if (!existing) {
        const task = await this.repository.createSmartTaskFromApplication(userId, company._id)
        if (task) tasks.push(task)
      }
    }

    return tasks
  }

  async syncAll(userId) {
    const [interviewTasks, dsaTasks, appTasks] = await Promise.all([
      this.syncWithInterviews(userId),
      this.syncWithDSA(userId),
      this.syncWithApplications(userId),
    ])

    return {
      interviewTasks,
      dsaTasks,
      appTasks,
      total: interviewTasks.length + dsaTasks.length + appTasks.length,
    }
  }
}
