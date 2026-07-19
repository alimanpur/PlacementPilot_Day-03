import mongoose from 'mongoose'
import { DSARepository } from '../repositories/dsa.repository.js'
import { DSARoadmap } from '../models/dsa.model.js'
import { NotificationService } from './notification.service.js'
import { AnalyticsService } from './analytics.service.js'

export class DSAService {
  constructor() {
    this.repository = new DSARepository()
    this.notificationService = new NotificationService()
    this.analyticsService = new AnalyticsService()
  }

  // ── Topics ──────────────────────────────────────────────────────────────

  async createTopic(userId, data) {
    const existing = await this.repository.findTopicByName(userId, data.topic)
    if (existing) {
      throw new Error('Topic with this name already exists')
    }

    const topic = await this.repository.createTopic(userId, data)
    return topic
  }

  async getTopics(userId) {
    const topics = await this.repository.findTopics(userId)
    return topics
  }

  async getTopic(userId, id) {
    const topic = await this.repository.findTopicById(userId, id)
    if (!topic) throw new Error('Topic not found')
    return topic
  }

  async updateTopic(userId, id, data) {
    const topic = await this.repository.updateTopic(userId, id, data)
    if (!topic) throw new Error('Topic not found')
    return topic
  }

  async deleteTopic(userId, id) {
    const topic = await this.repository.deleteTopic(userId, id)
    if (!topic) throw new Error('Topic not found')
    return topic
  }

  async recalculateTopicMastery(userId, topicName) {
    const { problems } = await this.repository.findProblems(userId, { topic: topicName })
    const solved = problems.filter((p) => p.status === 'solved' || p.status === 'reviewed' || p.status === 'mastered').length
    const total = problems.length
    const mastery = total > 0 ? Math.round((solved / total) * 100) : 0

    const topic = await this.repository.findTopicByName(userId, topicName)
    if (topic) {
      await this.repository.updateTopic(userId, topic._id, {
        solved,
        total,
        mastery,
        weak: mastery < 40,
      })
    }

    return { solved, total, mastery }
  }

  // ── Problems ────────────────────────────────────────────────────────────

  async logProblem(userId, data) {
    const problem = await this.repository.createProblem(userId, {
      ...data,
      started: true,
      startedAt: new Date(),
      status: data.status || 'not_started',
    })

    if (problem.status === 'solved') {
      problem.solvedAt = new Date()
      await this.repository.updateProblem(userId, problem._id, { solvedAt: new Date() })
      await this._updateTopicProgress(userId, problem.topic)
      await this._createRevisionIfNeeded(userId, problem)
      await this._updateHeatmap(userId)
    }

    await this._createTimelineEntry(userId, problem._id, {
      action: problem.status === 'solved' ? 'solved' : 'started',
      description: `Problem ${problem.status === 'solved' ? 'solved' : 'started'}: ${problem.title}`,
    })

    return problem
  }

  async getProblems(userId, options = {}) {
    return this.repository.findProblems(userId, options)
  }

  async getProblem(userId, id) {
    const problem = await this.repository.findProblemById(userId, id)
    if (!problem) throw new Error('Problem not found')
    return problem
  }

  async updateProblem(userId, id, data) {
    const existing = await this.repository.findProblemById(userId, id)
    if (!existing) throw new Error('Problem not found')

    const updates = { ...data, updatedBy: userId }

    if (data.status === 'solved' && existing.status !== 'solved') {
      updates.solvedAt = new Date()
      await this._updateTopicProgress(userId, existing.topic)
      await this._createRevisionIfNeeded(userId, { ...existing.toObject(), ...data })
    }

    if (data.status && data.status !== existing.status) {
      await this._createTimelineEntry(userId, id, {
        action: data.status,
        description: `Status changed to ${data.status}: ${existing.title}`,
      })
    }

    const problem = await this.repository.updateProblem(userId, id, updates)
    return problem
  }

  async deleteProblem(userId, id) {
    const problem = await this.repository.deleteProblem(userId, id)
    if (!problem) throw new Error('Problem not found')
    await this._updateTopicProgress(userId, problem.topic)
    return problem
  }

  async bulkUpdateProblems(userId, ids, data) {
    if (!ids.length) throw new Error('No problem IDs provided')
    const result = await this.repository.bulkUpdateProblems(userId, ids, data)
    return { modified: result.modifiedCount }
  }

  async bulkDeleteProblems(userId, ids) {
    if (!ids.length) throw new Error('No problem IDs provided')
    const result = await this.repository.bulkDeleteProblems(userId, ids)
    return { deleted: result.modifiedCount }
  }

  async toggleFavorite(userId, id) {
    const problem = await this.repository.findProblemById(userId, id)
    if (!problem) throw new Error('Problem not found')
    return this.repository.updateProblem(userId, id, { favorite: !problem.favorite })
  }

  async toggleBookmark(userId, id) {
    const problem = await this.repository.findProblemById(userId, id)
    if (!problem) throw new Error('Problem not found')
    return this.repository.updateProblem(userId, id, { bookmarked: !problem.bookmarked })
  }

  async toggleStar(userId, id) {
    const problem = await this.repository.findProblemById(userId, id)
    if (!problem) throw new Error('Problem not found')
    return this.repository.updateProblem(userId, id, { starred: !problem.starred })
  }

  // ── Sessions ────────────────────────────────────────────────────────────

  async createSession(userId, data) {
    const session = await this.repository.createSession(userId, {
      ...data,
      startTime: data.startTime || new Date(),
    })
    return session
  }

  async getSessions(userId, options = {}) {
    return this.repository.findSessions(userId, options)
  }

  async getSession(userId, id) {
    const session = await this.repository.findSessionById(userId, id)
    if (!session) throw new Error('Session not found')
    return session
  }

  async updateSession(userId, id, data) {
    const session = await this.repository.updateSession(userId, id, data)
    if (!session) throw new Error('Session not found')
    return session
  }

  async endSession(userId, id) {
    const session = await this.repository.findSessionById(userId, id)
    if (!session) throw new Error('Session not found')
    if (session.endTime) throw new Error('Session already ended')

    const endTime = new Date()
    const duration = (endTime - session.startTime) / 1000 / 60

    const accuracy = session.problemsAttempted > 0
      ? Math.round((session.problemsSolved / session.problemsAttempted) * 100)
      : 0

    return this.repository.updateSession(userId, id, {
      endTime,
      duration,
      accuracy,
    })
  }

  async deleteSession(userId, id) {
    const session = await this.repository.deleteSession(userId, id)
    if (!session) throw new Error('Session not found')
    return session
  }

  // ── Roadmaps ────────────────────────────────────────────────────────────

  async createRoadmap(userId, data) {
    const existing = await DSARoadmap.findOne({ userId, type: data.type, company: data.company, deletedAt: null })
    if (existing) {
      throw new Error('Roadmap of this type already exists for this company')
    }

    if (data.isActive) {
      await DSARoadmap.updateMany({ userId, deletedAt: null }, { isActive: false })
    }

    const roadmap = await this.repository.createRoadmap(userId, data)
    return roadmap
  }

  async getRoadmaps(userId) {
    return this.repository.findRoadmaps(userId)
  }

  async getRoadmap(userId, id) {
    const roadmap = await this.repository.findRoadmapById(userId, id)
    if (!roadmap) throw new Error('Roadmap not found')
    return roadmap
  }

  async updateRoadmap(userId, id, data) {
    if (data.isActive) {
      await DSARoadmap.updateMany({ userId, _id: { $ne: id }, deletedAt: null }, { isActive: false })
    }

    const roadmap = await this.repository.updateRoadmap(userId, id, data)
    if (!roadmap) throw new Error('Roadmap not found')
    return roadmap
  }

  async deleteRoadmap(userId, id) {
    const roadmap = await this.repository.deleteRoadmap(userId, id)
    if (!roadmap) throw new Error('Roadmap not found')
    return roadmap
  }

  async completeRoadmapProblem(userId, roadmapId, problemId) {
    const roadmap = await this.repository.findRoadmapById(userId, roadmapId)
    if (!roadmap) throw new Error('Roadmap not found')

    const problem = await this.repository.findProblemById(userId, problemId)
    if (!problem) throw new Error('Problem not found')

    const problemIndex = roadmap.problems.findIndex((p) => p.problemId.toString() === problemId)
    if (problemIndex === -1) throw new Error('Problem not in roadmap')

    const updatedProblems = [...roadmap.problems]
    updatedProblems[problemIndex] = {
      ...updatedProblems[problemIndex],
      status: 'completed',
      completedAt: new Date(),
    }

    await this.repository.updateRoadmap(userId, roadmapId, { problems: updatedProblems })
    await this.repository.updateRoadmapProgress(userId, roadmapId)
    return this.repository.findRoadmapById(userId, roadmapId)
  }

  async getRoadmapProgress(userId, id) {
    const roadmap = await this.repository.findRoadmapById(userId, id)
    if (!roadmap) throw new Error('Roadmap not found')
    return {
      total: roadmap.totalProblems,
      completed: roadmap.completedProblems,
      progress: roadmap.progress,
    }
  }

  // ── Revisions ───────────────────────────────────────────────────────────

  async createRevision(userId, data) {
    const revision = await this.repository.createRevision(userId, data)
    return revision
  }

  async getRevisions(userId, filters = {}) {
    return this.repository.findRevisions(userId, filters)
  }

  async getRevision(userId, id) {
    const revision = await this.repository.findRevisionById(userId, id)
    if (!revision) throw new Error('Revision not found')
    return revision
  }

  async updateRevision(userId, id, data) {
    const revision = await this.repository.updateRevision(userId, id, data)
    if (!revision) throw new Error('Revision not found')
    return revision
  }

  async completeRevision(userId, id) {
    const revision = await this.repository.updateRevision(userId, id, {
      status: 'completed',
      completedAt: new Date(),
    })

    if (revision) {
      const problem = await this.repository.findProblemById(userId, revision.problem)
      if (problem) {
        await this.repository.updateProblem(userId, revision.problem, {
          revisionCount: (problem.revisionCount || 0) + 1,
          status: problem.status === 'reviewed' ? 'mastered' : 'reviewed',
        })
      }
    }

    return revision
  }

  async skipRevision(userId, id) {
    const revision = await this.repository.updateRevision(userId, id, { status: 'skipped' })
    if (!revision) throw new Error('Revision not found')
    return revision
  }

  async deleteRevision(userId, id) {
    const revision = await this.repository.deleteRevision(userId, id)
    if (!revision) throw new Error('Revision not found')
    return revision
  }

  async generateRevisionsForProblem(userId, problemId) {
    const problem = await this.repository.findProblemById(userId, problemId)
    if (!problem) throw new Error('Problem not found')

    const intervals = [1, 3, 7, 14, 30]
    const revisions = []

    for (let i = 0; i < intervals.length; i++) {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + intervals[i])

      revisions.push(
        this.repository.createRevision(userId, {
          problem: problemId,
          problemTitle: problem.title,
          problemDifficulty: problem.difficulty,
          problemTopic: problem.topic,
          dueDate,
          revisionCount: i + 1,
          interval: intervals[i],
        }),
      )
    }

    await Promise.all(revisions)
    return revisions
  }

  async getDailyRevisionQueue(userId) {
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    return this.repository.findDueRevisions(userId, today)
  }

  async getWeeklyRevisionQueue(userId) {
    const weekEnd = new Date()
    weekEnd.setDate(weekEnd.getDate() + 7)

    return this.repository.findRevisions(userId, {
      dueDate: { $lte: weekEnd },
      status: 'pending',
    })
  }

  async getRevisionQueue(userId) {
    return this.repository.findRevisions(userId, {
      status: 'pending',
    })
  }

  async getMissedRevisions(userId) {
    return this.repository.findMissedRevisions(userId)
  }

  // ── Analytics & Insights ────────────────────────────────────────────────

  async getStats(userId) {
    return this.repository.getDashboardStats(userId)
  }

  async getInsights(userId) {
    return this.repository.getInsights(userId)
  }

  async getHeatmap(userId, days = 84) {
    return this.repository.findHeatmap(userId, days)
  }

  async getStreak(userId) {
    return this.repository.getStreak(userId)
  }

  async getLongestStreak(userId) {
    return this.repository.getLongestStreak(userId)
  }

  async getWeeklySolved(userId) {
    return this.repository.getWeeklySolved(userId)
  }

  async getMonthlySolved(userId) {
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    return DSAProblem.countDocuments({
      userId,
      deletedAt: null,
      solvedAt: { $gte: monthStart },
    })
  }

  async getWeakTopics(userId, limit = 5) {
    const topics = await this.repository.getWeakTopics(userId, limit)
    return topics.map((t) => ({
      topic: t.topic,
      mastery: t.mastery,
      solved: t.solved,
      total: t.total,
    }))
  }

  async getStrongTopics(userId, limit = 5) {
    const topics = await this.repository.getStrongTopics(userId, limit)
    return topics.map((t) => ({
      topic: t.topic,
      mastery: t.mastery,
      solved: t.solved,
      total: t.total,
    }))
  }

  async getCompanyReadiness(userId, companyName) {
    return this.repository.getCompanyReadiness(userId, companyName)
  }

  async getCompanyFrequentTopics(userId, companyName) {
    return this.repository.getCompanyFrequentTopics(userId, companyName)
  }

  async getRecommendedProblems(userId, weakTopicIds = [], limit = 10) {
    return this.repository.getRecommendedProblems(userId, weakTopicIds, limit)
  }

  async getInterviewReadiness(userId) {
    const insights = await this.repository.getInsights(userId)
    const totalSolved = insights.totalSolved
    const weakTopics = insights.weakTopics.length

    let score = 0
    if (totalSolved >= 100) score += 40
    else if (totalSolved >= 50) score += 30
    else if (totalSolved >= 25) score += 20
    else if (totalSolved >= 10) score += 10

    if (weakTopics <= 2) score += 30
    else if (weakTopics <= 4) score += 20
    else if (weakTopics <= 6) score += 10

    score += Math.min(insights.revisionCompletion, 30)

    return {
      score: Math.min(score, 100),
      totalSolved,
      weakTopics,
      revisionCompletion: insights.revisionCompletion,
    }
  }

  async getBookmarks(userId, options = {}) {
    return this.repository.getBookmarks(userId, options)
  }

  async getFavorites(userId, options = {}) {
    return this.repository.getFavorites(userId, options)
  }

  // ── Private helpers ─────────────────────────────────────────────────────

  async _updateTopicProgress(userId, topicName) {
    const { solved, total, mastery } = await this.recalculateTopicMastery(userId, topicName)

    if (mastery >= 80) {
      await this.notificationService.createNotification(userId, {
        type: 'dsa',
        title: 'Topic Mastered!',
        message: `You've reached ${mastery}% mastery in ${topicName}`,
        tag: 'dsa',
        meta: JSON.stringify({ topic: topicName, mastery }),
      })
    }
  }

  async _createRevisionIfNeeded(userId, problem) {
    if (problem.status !== 'solved') return

    const revision = await this.repository.createRevision(userId, {
      problem: problem._id || problem.problemId,
      problemTitle: problem.title,
      problemDifficulty: problem.difficulty,
      problemTopic: problem.topic,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      revisionCount: 1,
      interval: 1,
    })

    return revision
  }

  async _updateHeatmap(userId) {
    const today = new Date().toISOString().split('T')[0]
    await this.repository.upsertHeatmap(userId, today)
  }

  async _createTimelineEntry(userId, problemId, entry) {
    await this.repository.updateProblem(userId, problemId, {
      $push: { timeline: { ...entry, timestamp: new Date() } },
    })
  }
}
