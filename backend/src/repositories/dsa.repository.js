import mongoose from 'mongoose'
import {
  DSAProblem,
  DSATopic,
  DSASession,
  DSARoadmap,
  DSARevision,
  DSAHeatmap,
} from '../models/dsa.model.js'

export class DSARepository {
  // ── Topics ──────────────────────────────────────────────────────────────

  async createTopic(userId, data) {
    return DSATopic.create({ ...data, userId })
  }

  async findTopics(userId, filters = {}) {
    return DSATopic.find({ userId, deletedAt: null, ...filters }).sort({ mastery: 1 })
  }

  async findTopicById(userId, id) {
    return DSATopic.findOne({ _id: id, userId, deletedAt: null })
  }

  async findTopicByName(userId, name) {
    return DSATopic.findOne({ topic: name, userId, deletedAt: null })
  }

  async updateTopic(userId, id, data) {
    return DSATopic.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      data,
      { new: true, runValidators: true },
    )
  }

  async deleteTopic(userId, id) {
    return DSATopic.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    )
  }

  async bulkUpdateTopics(userId, ids, data) {
    return DSATopic.updateMany(
      { _id: { $in: ids }, userId, deletedAt: null },
      { $set: data },
    )
  }

  // ── Problems ────────────────────────────────────────────────────────────

  async createProblem(userId, data) {
    return DSAProblem.create({ ...data, userId })
  }

  async findProblems(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      difficulty,
      topic,
      status,
      platform,
      pattern,
      company,
      bookmarked,
      favorite,
      starred,
      revisionDue,
      tags,
      startDate,
      endDate,
    } = options

    const query = { userId, deletedAt: null }

    if (difficulty) query.difficulty = difficulty
    if (topic) query.topic = topic
    if (status) query.status = status
    if (platform) query.platform = platform
    if (pattern) query.pattern = pattern
    if (company) query.companiesAsked = company
    if (bookmarked === true || bookmarked === 'true') query.bookmarked = true
    if (favorite === true || favorite === 'true') query.favorite = true
    if (starred === true || starred === 'true') query.starred = true
    if (tags) query.tags = { $in: tags.split(',').map((t) => t.trim()) }
    if (revisionDue === true || revisionDue === 'true') {
      query['revisionSchedule.nextRevision'] = { $lte: new Date() }
      query.status = { $nin: ['mastered'] }
    }
    if (startDate || endDate) {
      query.solvedAt = {}
      if (startDate) query.solvedAt.$gte = new Date(startDate)
      if (endDate) query.solvedAt.$lte = new Date(endDate)
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { pattern: { $regex: search, $options: 'i' } },
        { subtopics: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { companiesAsked: { $regex: search, $options: 'i' } },
        { problemId: { $regex: search, $options: 'i' } },
      ]
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
    const skip = (page - 1) * limit

    const [problems, total] = await Promise.all([
      DSAProblem.find(query).sort(sort).skip(skip).limit(limit).lean(),
      DSAProblem.countDocuments(query),
    ])

    return { problems, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) }
  }

  async findProblemById(userId, id) {
    return DSAProblem.findOne({ _id: id, userId, deletedAt: null })
  }

  async updateProblem(userId, id, data) {
    return DSAProblem.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      data,
      { new: true, runValidators: true },
    )
  }

  async deleteProblem(userId, id) {
    return DSAProblem.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    )
  }

  async bulkUpdateProblems(userId, ids, data) {
    return DSAProblem.updateMany(
      { _id: { $in: ids }, userId, deletedAt: null },
      { $set: data },
    )
  }

  async bulkDeleteProblems(userId, ids) {
    return DSAProblem.updateMany(
      { _id: { $in: ids }, userId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
    )
  }

  async findProblemByProblemId(userId, problemId) {
    return DSAProblem.findOne({ userId, problemId, deletedAt: null })
  }

  // ── Sessions ────────────────────────────────────────────────────────────

  async createSession(userId, data) {
    return DSASession.create({ ...data, userId })
  }

  async findSessions(userId, options = {}) {
    const { page = 1, limit = 20, sortBy = 'startTime', sortOrder = 'desc' } = options
    const query = { userId, deletedAt: null }
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
    const skip = (page - 1) * limit

    const [sessions, total] = await Promise.all([
      DSASession.find(query).sort(sort).skip(skip).limit(limit).lean(),
      DSASession.countDocuments(query),
    ])

    return { sessions, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) }
  }

  async findSessionById(userId, id) {
    return DSASession.findOne({ _id: id, userId, deletedAt: null })
  }

  async updateSession(userId, id, data) {
    return DSASession.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      data,
      { new: true, runValidators: true },
    )
  }

  async deleteSession(userId, id) {
    return DSASession.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    )
  }

  // ── Roadmaps ────────────────────────────────────────────────────────────

  async createRoadmap(userId, data) {
    return DSARoadmap.create({ ...data, userId })
  }

  async findRoadmaps(userId, filters = {}) {
    return DSARoadmap.find({ userId, deletedAt: null, ...filters }).sort({ createdAt: -1 })
  }

  async findRoadmapById(userId, id) {
    return DSARoadmap.findOne({ _id: id, userId, deletedAt: null })
  }

  async findActiveRoadmap(userId) {
    return DSARoadmap.findOne({ userId, deletedAt: null, isActive: true })
  }

  async updateRoadmap(userId, id, data) {
    return DSARoadmap.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      data,
      { new: true, runValidators: true },
    )
  }

  async deleteRoadmap(userId, id) {
    return DSARoadmap.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    )
  }

  async updateRoadmapProgress(userId, id) {
    const roadmap = await this.findRoadmapById(userId, id)
    if (!roadmap) return null

    const total = roadmap.problems?.length || roadmap.totalProblems || 0
    const completed = roadmap.problems?.filter((p) => p.status === 'completed').length || roadmap.completedProblems || 0
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0

    return DSARoadmap.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      {
        totalProblems: total,
        completedProblems: completed,
        progress,
        completedAt: progress === 100 ? new Date() : undefined,
      },
      { new: true },
    )
  }

  // ── Revisions ───────────────────────────────────────────────────────────

  async createRevision(userId, data) {
    return DSARevision.create({ ...data, userId })
  }

  async findRevisions(userId, filters = {}) {
    return DSARevision.find({ userId, deletedAt: null, ...filters }).sort({ dueDate: 1 })
  }

  async findRevisionById(userId, id) {
    return DSARevision.findOne({ _id: id, userId, deletedAt: null })
  }

  async updateRevision(userId, id, data) {
    return DSARevision.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      data,
      { new: true, runValidators: true },
    )
  }

  async deleteRevision(userId, id) {
    return DSARevision.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    )
  }

  async findDueRevisions(userId, beforeDate) {
    return DSARevision.find({
      userId,
      deletedAt: null,
      dueDate: { $lte: beforeDate || new Date() },
      status: 'pending',
    }).sort({ dueDate: 1 })
  }

  async findMissedRevisions(userId) {
    return DSARevision.find({
      userId,
      deletedAt: null,
      dueDate: { $lt: new Date() },
      status: 'pending',
    }).sort({ dueDate: 1 })
  }

  // ── Heatmap ─────────────────────────────────────────────────────────────

  async upsertHeatmap(userId, date, data = {}) {
    return DSAHeatmap.findOneAndUpdate(
      { userId, date },
      { $inc: { count: 1 }, $set: { ...data, userId, date }, $push: data.problems ? { problems: { $each: data.problems } } : {} },
      { new: true, upsert: true },
    )
  }

  async findHeatmap(userId, days = 84) {
    const data = []
    const now = new Date()

    for (let i = days; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const entry = await DSAHeatmap.findOne({ userId, date: dateStr }).lean()
      data.push({
        date: dateStr,
        count: entry?.count || 0,
        intensity: (entry?.count || 0) === 0 ? 0 : Math.min(Math.ceil((entry?.count || 0) / 2), 4),
      })
    }

    return data
  }

  // ── Analytics ───────────────────────────────────────────────────────────

  async getTotalSolved(userId) {
    return DSAProblem.countDocuments({ userId, deletedAt: null, status: 'solved' })
  }

  async getDifficultyBreakdown(userId) {
    const [easy, medium, hard] = await Promise.all([
      DSAProblem.countDocuments({ userId, deletedAt: null, difficulty: 'easy' }),
      DSAProblem.countDocuments({ userId, deletedAt: null, difficulty: 'medium' }),
      DSAProblem.countDocuments({ userId, deletedAt: null, difficulty: 'hard' }),
    ])

    return { easy, medium, hard, total: easy + medium + hard }
  }

  async getWeakTopics(userId, limit = 5) {
    return DSATopic.find({ userId, deletedAt: null })
      .sort({ mastery: 1 })
      .limit(limit)
  }

  async getStrongTopics(userId, limit = 5) {
    return DSATopic.find({ userId, deletedAt: null })
      .sort({ mastery: -1 })
      .limit(limit)
  }

  async getTopicDistribution(userId) {
    return DSATopic.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      { $group: { _id: '$topic', solved: { $sum: '$solved' }, total: { $sum: '$total' }, mastery: { $avg: '$mastery' } } },
      { $sort: { solved: -1 } },
    ])
  }

  async getMonthlyTrends(userId, months = 6) {
    const data = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const [solved, easy, medium, hard] = await Promise.all([
        DSAProblem.countDocuments({ userId, deletedAt: null, solvedAt: { $gte: monthStart, $lt: monthEnd } }),
        DSAProblem.countDocuments({ userId, deletedAt: null, solvedAt: { $gte: monthStart, $lt: monthEnd }, difficulty: 'easy' }),
        DSAProblem.countDocuments({ userId, deletedAt: null, solvedAt: { $gte: monthStart, $lt: monthEnd }, difficulty: 'medium' }),
        DSAProblem.countDocuments({ userId, deletedAt: null, solvedAt: { $gte: monthStart, $lt: monthEnd }, difficulty: 'hard' }),
      ])

      data.push({
        month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        solved,
        easy,
        medium,
        hard,
      })
    }

    return data
  }

  async getStreak(userId) {
    const problems = await DSAProblem.find({ userId, deletedAt: null })
      .sort({ solvedAt: -1 })
      .select('solvedAt')
      .lean()

    if (!problems.length) return 0

    const dates = new Set(problems.map((p) => new Date(p.solvedAt).toDateString()))
    const checkDate = new Date()
    let streak = 0

    while (dates.has(checkDate.toDateString())) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    }

    return streak
  }

  async getLongestStreak(userId) {
    const problems = await DSAProblem.find({ userId, deletedAt: null })
      .sort({ solvedAt: -1 })
      .select('solvedAt')
      .lean()

    if (!problems.length) return 0

    const dates = [...new Set(problems.map((p) => new Date(p.solvedAt).toDateString()))].sort((a, b) => new Date(b) - new Date(a))
    let longestStreak = 0
    let currentStreak = 1

    for (let i = 0; i < dates.length - 1; i++) {
      const current = new Date(dates[i])
      const next = new Date(dates[i + 1])
      const diffDays = (current - next) / (1000 * 60 * 60 * 24)

      if (diffDays === 1) {
        currentStreak++
        longestStreak = Math.max(longestStreak, currentStreak)
      } else {
        currentStreak = 1
      }
    }

    return longestStreak
  }

  async getWeeklySolved(userId, days = 7) {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - days)
    weekStart.setHours(0, 0, 0, 0)

    return DSAProblem.countDocuments({
      userId,
      deletedAt: null,
      solvedAt: { $gte: weekStart },
    })
  }

  async getAverageSolveTime(userId) {
    const result = await DSAProblem.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null, timeTaken: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$timeTaken' } } },
    ])
    return Math.round(result[0]?.avg || 0)
  }

  async getAcceptanceRate(userId) {
    const [total, solved] = await Promise.all([
      DSAProblem.countDocuments({ userId, deletedAt: null }),
      DSAProblem.countDocuments({ userId, deletedAt: null, status: 'solved' }),
    ])
    return total > 0 ? Math.round((solved / total) * 100) : 0
  }

  async getRevisionCompletion(userId) {
    const [total, completed] = await Promise.all([
      DSARevision.countDocuments({ userId, deletedAt: null }),
      DSARevision.countDocuments({ userId, deletedAt: null, status: 'completed' }),
    ])
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  async getHeatmapData(userId, days = 84) {
    return this.findHeatmap(userId, days)
  }

  async getRevisionQueue(userId) {
    return this.findDueRevisions(userId)
  }

  async getCompanyReadiness(userId, companyName) {
    const problems = await DSAProblem.find({
      userId,
      deletedAt: null,
      companiesAsked: { $in: [companyName] },
      status: 'solved',
    }).lean()

    const total = await DSAProblem.countDocuments({
      userId,
      deletedAt: null,
      companiesAsked: { $in: [companyName] },
    })

    const solved = problems.length
    const byDifficulty = { easy: 0, medium: 0, hard: 0 }
    problems.forEach((p) => {
      if (byDifficulty[p.difficulty] !== undefined) byDifficulty[p.difficulty]++
    })

    return {
      total,
      solved,
      percentage: total > 0 ? Math.round((solved / total) * 100) : 0,
      byDifficulty,
    }
  }

  async getCompanyFrequentTopics(userId, companyName) {
    return DSAProblem.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          deletedAt: null,
          companiesAsked: { $in: [companyName] },
        },
      },
      {
        $group: {
          _id: '$topic',
          count: { $sum: 1 },
          solved: { $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])
  }

  async getRecommendedProblems(userId, weakTopicIds = [], limit = 10) {
    const query = { userId, deletedAt: null, status: { $nin: ['solved', 'mastered'] } }
    if (weakTopicIds.length > 0) {
      query.topic = { $in: weakTopicIds }
    }

    return DSAProblem.find(query)
      .sort({ frequency: -1, difficulty: 1 })
      .limit(limit)
      .lean()
  }

  async getInsights(userId) {
    const [
      totalSolved,
      difficultyBreakdown,
      weakTopics,
      strongTopics,
      topicDistribution,
      monthlyTrends,
      streak,
      longestStreak,
      weeklySolved,
      averageSolveTime,
      acceptanceRate,
      revisionCompletion,
      revisionQueue,
      heatmap,
    ] = await Promise.all([
      this.getTotalSolved(userId),
      this.getDifficultyBreakdown(userId),
      this.getWeakTopics(userId),
      this.getStrongTopics(userId),
      this.getTopicDistribution(userId),
      this.getMonthlyTrends(userId, 6),
      this.getStreak(userId),
      this.getLongestStreak(userId),
      this.getWeeklySolved(userId),
      this.getAverageSolveTime(userId),
      this.getAcceptanceRate(userId),
      this.getRevisionCompletion(userId),
      this.getRevisionQueue(userId),
      this.getHeatmapData(userId, 84),
    ])

    const weakTopicIds = weakTopics.map((t) => t.topic)

    return {
      totalSolved,
      difficultyBreakdown,
      weakTopics: weakTopics.map((t) => ({
        topic: t.topic,
        mastery: t.mastery,
        solved: t.solved,
        total: t.total,
      })),
      strongTopics: strongTopics.map((t) => ({
        topic: t.topic,
        mastery: t.mastery,
        solved: t.solved,
        total: t.total,
      })),
      topicDistribution,
      monthlyTrends,
      streak,
      longestStreak,
      weeklySolved,
      averageSolveTime,
      acceptanceRate,
      revisionCompletion,
      revisionQueue: revisionQueue.map((r) => ({
        id: r._id,
        problemTitle: r.problemTitle,
        problemDifficulty: r.problemDifficulty,
        problemTopic: r.problemTopic,
        dueDate: r.dueDate,
        status: r.status,
        revisionCount: r.revisionCount,
      })),
      heatmap,
      recommendations: {
        weakTopics: weakTopicIds.slice(0, 3),
        suggestedProblems: [],
      },
    }
  }

  async getBookmarks(userId, options = {}) {
    return this.findProblems(userId, { ...options, bookmarked: true })
  }

  async getFavorites(userId, options = {}) {
    return this.findProblems(userId, { ...options, favorite: true })
  }

  async findRecent(userId, limit = 10) {
    return DSAProblem.find({ userId, deletedAt: null })
      .sort({ solvedAt: -1 })
      .limit(limit)
      .lean()
  }

  async getDashboardStats(userId) {
    const [
      totalSolved,
      difficultyBreakdown,
      weakTopics,
      streak,
      weeklySolved,
      revisionQueue,
      heatmap,
      sessionsThisWeek,
      averageSessionTime,
    ] = await Promise.all([
      this.getTotalSolved(userId),
      this.getDifficultyBreakdown(userId),
      this.getWeakTopics(userId, 3),
      this.getStreak(userId),
      this.getWeeklySolved(userId),
      this.getRevisionQueue(userId),
      this.getHeatmapData(userId, 84),
      DSASession.countDocuments({
        userId,
        deletedAt: null,
        startTime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      DSASession.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            deletedAt: null,
            endTime: { $exists: true },
            startTime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: null,
            avgDuration: {
              $avg: { $subtract: ['$endTime', '$startTime'] },
            },
          },
        },
      ]),
    ])

    return {
      totalSolved,
      difficultyBreakdown,
      weakTopics: weakTopics.map((t) => ({
        topic: t.topic,
        mastery: t.mastery,
        solved: t.solved,
        total: t.total,
      })),
      streak,
      weeklySolved,
      revisionQueueCount: revisionQueue.length,
      heatmap,
      sessionsThisWeek,
      averageSessionTime: averageSessionTime[0]?.avgDuration
        ? Math.round(averageSessionTime[0].avgDuration / 60000)
        : 0,
    }
  }
}
