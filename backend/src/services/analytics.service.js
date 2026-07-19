import { Company } from '../models/company.model.js'
import { Interview } from '../models/interview.model.js'
import { Application } from '../models/application.model.js'
import { DSATopic, DSAProblem, DSARevision, DSARoadmap } from '../models/dsa.model.js'
import { Goal } from '../models/goal.model.js'
import { PlannerTask, PlannerHabit } from '../models/planner.model.js'
import mongoose from 'mongoose'

export class AnalyticsService {
  // ── Overview ─────────────────────────────────────────────────────────────

  async getOverview(userId) {
    const [
      readiness,
      applicationStats,
      interviewStats,
      dsaStats,
      plannerStats,
      upcomingDeadlines,
      streak,
    ] = await Promise.all([
      this.getReadinessScore(userId),
      this.getApplicationStats(userId),
      this.getInterviewStats(userId),
      this.getDsaOverview(userId),
      this.getPlannerOverview(userId),
      this.getUpcomingDeadlines(userId),
      this.getStreak(userId),
    ])

    return {
      readiness,
      applications: applicationStats,
      interviews: interviewStats,
      dsa: dsaStats,
      planner: plannerStats,
      upcomingDeadlines,
      streak,
      generatedAt: new Date().toISOString(),
    }
  }

  async getReadinessScore(userId) {
    const [coding, interviewReadiness, goalReadiness, profileScore] = await Promise.all([
      this.getCodingReadiness(userId),
      this.getInterviewReadiness(userId),
      this.getGoalReadiness(userId),
      this.getProfileScore(userId),
    ])

    const overall = Math.round((coding * 0.35) + (interviewReadiness * 0.25) + (goalReadiness * 0.25) + (profileScore * 0.15))

    return {
      overall,
      coding,
      interviewReadiness,
      goalReadiness,
      profileScore,
    }
  }

  async getReadinessBreakdown(userId) {
    const [coding, interviewReadiness, goalReadiness, profileScore] = await Promise.all([
      this.getCodingReadiness(userId),
      this.getInterviewReadiness(userId),
      this.getGoalReadiness(userId),
      this.getProfileScore(userId),
    ])

    return {
      coding: {
        score: coding,
        weight: 35,
        label: 'Coding Proficiency',
        description: coding < 30 ? 'Start solving DSA problems' : coding < 60 ? 'Good progress, keep practicing' : 'Strong coding foundation',
      },
      interviewReadiness: {
        score: interviewReadiness,
        weight: 25,
        label: 'Interview Performance',
        description: interviewReadiness < 30 ? 'Schedule mock interviews' : interviewReadiness < 60 ? 'Practice more interviews' : 'Great interview track record',
      },
      goalReadiness: {
        score: goalReadiness,
        weight: 25,
        label: 'Goal Achievement',
        description: goalReadiness < 30 ? 'Set clear placement goals' : goalReadiness < 60 ? 'Make progress on goals' : 'Excellent goal tracking',
      },
      profileScore: {
        score: profileScore,
        weight: 15,
        label: 'Profile Completeness',
        description: profileScore < 50 ? 'Complete your profile' : 'Profile looks good',
      },
    }
  }

  async getCodingReadiness(userId) {
    const topics = await DSATopic.find({ userId, deletedAt: null })
    if (!topics.length) return 0

    const avgMastery = topics.reduce((sum, t) => sum + t.mastery, 0) / topics.length
    const totalSolved = await DSAProblem.countDocuments({ userId, deletedAt: null })

    const volumeScore = Math.min(totalSolved / 100, 1) * 20
    return Math.min(Math.round(avgMastery + volumeScore), 100)
  }

  async getInterviewReadiness(userId) {
    const interviews = await Interview.find({ userId, deletedAt: null })
    if (!interviews.length) return 0

    const cleared = interviews.filter((i) => i.status === 'completed' && i.result === 'pass').length
    const baseScore = (cleared / interviews.length) * 100

    const upcoming = interviews.filter((i) => i.status === 'scheduled' || i.status === 'rescheduled').length
    const bonus = upcoming > 0 ? 5 : 0

    return Math.min(Math.round(baseScore + bonus), 100)
  }

  async getGoalReadiness(userId) {
    const goals = await Goal.find({ userId, deletedAt: null })
    if (!goals.length) return 0

    const avgProgress = goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length
    return Math.round(avgProgress)
  }

  async getProfileScore(userId) {
    const user = await mongoose.model('User').findById(userId).select('name email school program location skills publicLinks season')
    if (!user) return 0

    let score = 0
    const checks = {
      name: user.name && user.name.length >= 2,
      email: user.email && user.email.includes('@'),
      school: user.school && user.school.length > 0,
      program: user.program && user.program.length > 0,
      location: user.location && user.location.length > 0,
      skills: user.skills && user.skills.length > 0,
      github: user.publicLinks?.github && user.publicLinks.github.length > 0,
      linkedin: user.publicLinks?.linkedin && user.publicLinks.linkedin.length > 0,
      season: user.season && user.season.length > 0,
    }

    const completedChecks = Object.values(checks).filter(Boolean).length
    score = (completedChecks / Object.keys(checks).length) * 100

    return Math.round(score)
  }

  // ── Application Analytics ────────────────────────────────────────────────

  async getApplicationStats(userId) {
    const stats = await Company.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          offers: { $sum: { $cond: [{ $eq: ['$status', 'offer'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $ne: ['$status', 'closed'] }, 1, 0] } },
          hot: { $sum: { $cond: [{ $eq: ['$status', 'hot'] }, 1, 0] } },
        },
      },
    ])

    return stats[0] || { total: 0, offers: 0, rejected: 0, inProgress: 0, hot: 0 }
  }

  async getNewApplicationStats(userId) {
    const stats = await Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          wishlist: { $sum: { $cond: [{ $eq: ['$currentStage', 'wishlist'] }, 1, 0] } },
          applied: { $sum: { $cond: [{ $eq: ['$currentStage', 'applied'] }, 1, 0] } },
          interviews: { $sum: { $cond: [{ $in: ['$currentStage', ['technical_interview', 'managerial_interview', 'hr_interview']] }, 1, 0] } },
          offers: { $sum: { $cond: [{ $eq: ['$currentStage', 'offer'] }, 1, 0] } },
          accepted: { $sum: { $cond: [{ $eq: ['$currentStage', 'accepted'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$currentStage', 'rejected'] }, 1, 0] } },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        },
      },
    ])

    return stats[0] || {
      total: 0,
      wishlist: 0,
      applied: 0,
      interviews: 0,
      offers: 0,
      accepted: 0,
      rejected: 0,
      active: 0,
    }
  }

  async getApplicationFunnel(userId) {
    const stages = [
      'wishlist',
      'ready_to_apply',
      'applied',
      'online_assessment',
      'technical_interview',
      'managerial_interview',
      'hr_interview',
      'offer',
      'accepted',
    ]

    const results = await Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      {
        $group: {
          _id: '$currentStage',
          count: { $sum: 1 },
        },
      },
    ])

    const map = new Map(results.map((r) => [r._id, r.count]))
    return stages.map((stage) => ({
      stage,
      label: stage.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      count: map.get(stage) || 0,
    }))
  }

  async getApplicationSources(userId) {
    return Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])
  }

  async getApplicationTrends(userId, months = 6) {
    const data = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const [applied, offers, rejected] = await Promise.all([
        Application.countDocuments({
          userId,
          appliedDate: { $gte: monthStart, $lt: monthEnd },
          deletedAt: null,
        }),
        Application.countDocuments({
          userId,
          currentStage: 'accepted',
          appliedDate: { $gte: monthStart, $lt: monthEnd },
          deletedAt: null,
        }),
        Application.countDocuments({
          userId,
          currentStage: 'rejected',
          appliedDate: { $gte: monthStart, $lt: monthEnd },
          deletedAt: null,
        }),
      ])

      data.push({
        month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        applied,
        offers,
        rejected,
      })
    }

    return data
  }

  async getAverageResponseTime(userId) {
    const applications = await Application.find({
      userId,
      deletedAt: null,
      appliedDate: { $exists: true },
      currentStage: { $in: ['offer', 'accepted', 'rejected'] },
    })
      .select('appliedDate updatedAt')
      .lean()

    if (!applications.length) return { average: 0, unit: 'days' }

    const totalDays = applications.reduce((sum, app) => {
      if (!app.updatedAt) return sum
      const diff = (new Date(app.updatedAt) - new Date(app.appliedDate)) / (1000 * 60 * 60 * 24)
      return sum + diff
    }, 0)

    return { average: Math.round(totalDays / applications.length), unit: 'days' }
  }

  async getStageDistribution(userId) {
    return Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      {
        $group: {
          _id: '$currentStage',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])
  }

  async getTopRecruiters(userId) {
    return Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null, recruiterName: { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$recruiterName',
          applications: { $sum: 1 },
          companies: { $addToSet: '$company' },
        },
      },
      { $sort: { applications: -1 } },
      { $limit: 10 },
    ])
  }

  async getTopCompanies(userId, limit = 10) {
    return Company.find({ userId, deletedAt: null, favorite: true })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('name industry stats')
      .lean()
  }

  async getOfferConversion(userId) {
    const [total, selected] = await Promise.all([
      Interview.countDocuments({ userId, deletedAt: null, status: 'completed' }),
      Interview.countDocuments({ userId, deletedAt: null, status: 'completed', 'feedback.decision': 'selected' }),
    ])
    return { total, selected, rate: total > 0 ? Math.round((selected / total) * 100) : 0 }
  }

  // ── Company Analytics ────────────────────────────────────────────────────

  async getCompanyAnalytics(userId) {
    const [industryDistribution, locationDistribution, hiringTrends, topCompanies, stats] = await Promise.all([
      this.getIndustryDistribution(userId),
      this.getLocationDistribution(userId),
      this.getHiringTrends(userId),
      this.getTopCompaniesBySuccess(userId),
      this.getCompanyStats(userId),
    ])

    return {
      industryDistribution,
      locationDistribution,
      hiringTrends,
      topCompanies,
      stats,
    }
  }

  async getIndustryDistribution(userId) {
    return Company.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null, industry: { $ne: null } } },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])
  }

  async getLocationDistribution(userId) {
    return Company.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null, country: { $ne: null } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])
  }

  async getHiringTrends(userId, months = 6) {
    const data = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const [active, offers, newCompanies] = await Promise.all([
        Company.countDocuments({
          userId,
          hiringStatus: 'Active',
          createdAt: { $gte: monthStart, $lt: monthEnd },
          deletedAt: null,
        }),
        Application.countDocuments({
          userId,
          currentStage: 'offer',
          appliedDate: { $gte: monthStart, $lt: monthEnd },
          deletedAt: null,
        }),
        Company.countDocuments({
          userId,
          createdAt: { $gte: monthStart, $lt: monthEnd },
          deletedAt: null,
        }),
      ])

      data.push({
        month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        active,
        offers,
        newCompanies,
      })
    }

    return data
  }

  async getTopCompaniesBySuccess(userId) {
    return Company.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      {
        $group: {
          _id: '$name',
          industry: { $first: '$industry' },
          totalApplications: { $sum: '$stats.applied' },
          totalInterviews: { $sum: '$stats.interviews' },
          totalOffers: { $sum: '$stats.offers' },
          successRate: { $avg: '$stats.successRate' },
        },
      },
      { $sort: { totalOffers: -1 } },
      { $limit: 10 },
    ])
  }

  async getCompanyStats(userId) {
    const [total, active, withOffers] = await Promise.all([
      Company.countDocuments({ userId, deletedAt: null }),
      Company.countDocuments({ userId, deletedAt: null, hiringStatus: 'Active' }),
      Company.countDocuments({ userId, deletedAt: null, 'stats.offers': { $gt: 0 } }),
    ])

    return { total, active, withOffers }
  }

  async getEligibilityAnalysis(userId) {
    const companies = await Company.find({ userId, deletedAt: null })
      .select('name industry stats requirements')
      .lean()

    return companies.map((c) => ({
      name: c.name,
      industry: c.industry,
      stats: c.stats || {},
      matchScore: this._calculateMatchScore(c),
    }))
  }

  _calculateMatchScore(company) {
    const stats = company.stats || {}
    const total = stats.applied || 0
    if (total === 0) return 0
    const success = (stats.successRate || 0) * total
    return Math.min(100, Math.round((success / total) * 100 + (stats.interviews || 0) * 2))
  }

  // ── Interview Analytics ──────────────────────────────────────────────────

  async getInterviewStats(userId) {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [
      totalInterviews,
      upcomingCount,
      completedCount,
      totalPassed,
      totalFailed,
      todayCount,
      pendingFeedback,
    ] = await Promise.all([
      Interview.countDocuments({ userId, deletedAt: null }),
      Interview.countDocuments({
        userId,
        deletedAt: null,
        archived: false,
        scheduledDate: { $gte: now },
        status: { $in: ['scheduled', 'rescheduled'] },
      }),
      Interview.countDocuments({
        userId,
        deletedAt: null,
        status: 'completed',
      }),
      Interview.countDocuments({
        userId,
        deletedAt: null,
        status: 'completed',
        result: 'pass',
      }),
      Interview.countDocuments({
        userId,
        deletedAt: null,
        status: 'completed',
        result: 'fail',
      }),
      Interview.countDocuments({
        userId,
        deletedAt: null,
        scheduledDate: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 86400000) },
        status: { $in: ['scheduled', 'rescheduled'] },
      }),
      Interview.countDocuments({
        userId,
        deletedAt: null,
        status: 'completed',
        'feedback.decision': { $exists: false },
      }),
    ])

    return {
      total: totalInterviews,
      upcoming: upcomingCount,
      completed: completedCount,
      passed: totalPassed,
      failed: totalFailed,
      today: todayCount,
      pendingFeedback,
      passRate: completedCount > 0 ? Math.round((totalPassed / completedCount) * 100) : 0,
    }
  }

  async getInterviewTrends(userId, months = 6) {
    const data = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const [scheduled, completed, passed, failed, cancelled] = await Promise.all([
        Interview.countDocuments({
          userId,
          deletedAt: null,
          createdAt: { $gte: monthStart, $lt: monthEnd },
        }),
        Interview.countDocuments({
          userId,
          deletedAt: null,
          status: 'completed',
          scheduledDate: { $gte: monthStart, $lt: monthEnd },
        }),
        Interview.countDocuments({
          userId,
          deletedAt: null,
          result: 'pass',
          scheduledDate: { $gte: monthStart, $lt: monthEnd },
        }),
        Interview.countDocuments({
          userId,
          deletedAt: null,
          result: 'fail',
          scheduledDate: { $gte: monthStart, $lt: monthEnd },
        }),
        Interview.countDocuments({
          userId,
          deletedAt: null,
          status: 'cancelled',
          scheduledDate: { $gte: monthStart, $lt: monthEnd },
        }),
      ])

      data.push({
        month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        scheduled,
        completed,
        passed,
        failed,
        cancelled,
      })
    }

    return data
  }

  async getInterviewTypeDistribution(userId) {
    return Interview.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])
  }

  async getInterviewDifficultyTrends(userId) {
    return Interview.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null, status: 'completed' } },
      {
        $group: {
          _id: '$feedback.difficulty',
          count: { $sum: 1 },
          avgRating: { $avg: '$feedback.rating' },
        },
      },
      { $sort: { count: -1 } },
    ])
  }

  async getInterviewAverageRating(userId) {
    const result = await Interview.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null, status: 'completed', 'feedback.rating': { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$feedback.rating' }, count: { $sum: 1 } } },
    ])
    const item = result[0] || {}
    return { average: item.avgRating ? Number(item.avgRating.toFixed(1)) : 0, count: item.count || 0 }
  }

  async getUpcomingSchedule(userId, limit = 10) {
    const now = new Date()
    return Interview.find({
      userId,
      deletedAt: null,
      archived: false,
      scheduledDate: { $gte: now },
      status: { $in: ['scheduled', 'rescheduled'] },
    })
      .sort({ scheduledDate: 1 })
      .limit(limit)
      .select('company role type scheduledDate scheduledTime duration mode meetingLink')
      .lean()
  }

  async getCancelledInterviews(userId, limit = 10) {
    return Interview.find({
      userId,
      deletedAt: null,
      status: 'cancelled',
    })
      .sort({ scheduledDate: -1 })
      .limit(limit)
      .select('company role type scheduledDate reason')
      .lean()
  }

  // ── DSA Analytics ────────────────────────────────────────────────────────

  async getDsaOverview(userId) {
    const [totalSolved, totalProblems, avgMastery, revisionStats] = await Promise.all([
      DSAProblem.countDocuments({ userId, deletedAt: null, status: 'solved' }),
      DSAProblem.countDocuments({ userId, deletedAt: null }),
      this.getAverageMastery(userId),
      this.getRevisionStats(userId),
    ])

    return {
      totalSolved,
      totalProblems,
      completionRate: totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0,
      avgMastery,
      revisionStats,
    }
  }

  async getDsaDifficultyBreakdown(userId) {
    return await DSAProblem.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      {
        $group: {
          _id: '$difficulty',
          total: { $sum: 1 },
          solved: { $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ])
  }

  async getDsaTopicMastery(userId) {
    return await DSATopic.find({ userId, deletedAt: null })
      .sort({ mastery: 1 })
      .select('topic category mastery solved total averageSolveTime')
      .lean()
  }

  async getWeakTopics(userId) {
    const topics = await DSATopic.find({ userId, deletedAt: null })
      .sort({ mastery: 1 })
      .limit(5)
      .select('topic category mastery solved total')
      .lean()

    return topics.map((t) => ({
      topic: t.topic,
      category: t.category,
      mastery: t.mastery,
      solved: t.solved,
      total: t.total,
    }))
  }

  async getStrongTopics(userId) {
    const topics = await DSATopic.find({ userId, deletedAt: null, mastery: { $gte: 70 } })
      .sort({ mastery: -1 })
      .limit(5)
      .select('topic category mastery solved total')
      .lean()

    return topics.map((t) => ({
      topic: t.topic,
      category: t.category,
      mastery: t.mastery,
      solved: t.solved,
      total: t.total,
    }))
  }

  async getAverageMastery(userId) {
    const topics = await DSATopic.find({ userId, deletedAt: null }).select('mastery')
    if (!topics.length) return 0
    return Math.round(topics.reduce((sum, t) => sum + t.mastery, 0) / topics.length)
  }

  async getRevisionStats(userId) {
    const [pending, completed, missed] = await Promise.all([
      DSARevision.countDocuments({ userId, deletedAt: null, status: 'pending' }),
      DSARevision.countDocuments({ userId, deletedAt: null, status: 'completed' }),
      DSARevision.countDocuments({ userId, deletedAt: null, status: 'missed' }),
    ])

    return { pending, completed, missed, total: pending + completed + missed }
  }

  async getDsaTrends(userId, months = 6) {
    const data = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const [solved, easy, medium, hard] = await Promise.all([
        DSAProblem.countDocuments({
          userId,
          solvedAt: { $gte: monthStart, $lt: monthEnd },
          deletedAt: null,
        }),
        DSAProblem.countDocuments({
          userId,
          solvedAt: { $gte: monthStart, $lt: monthEnd },
          difficulty: 'easy',
          deletedAt: null,
        }),
        DSAProblem.countDocuments({
          userId,
          solvedAt: { $gte: monthStart, $lt: monthEnd },
          difficulty: 'medium',
          deletedAt: null,
        }),
        DSAProblem.countDocuments({
          userId,
          solvedAt: { $gte: monthStart, $lt: monthEnd },
          difficulty: 'hard',
          deletedAt: null,
        }),
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

  async getDsaRoadmapProgress(userId) {
    return await DSARoadmap.find({ userId, deletedAt: null, isActive: true })
      .sort({ createdAt: -1 })
      .select('name type totalProblems completedProblems progress')
      .lean()
  }

  async getCompanyReadiness(userId, companyName) {
    const company = await Company.findOne({ userId, deletedAt: null, name: new RegExp(companyName, 'i') })
      .select('name industry stats')
      .lean()

    if (!company) return { ready: false, score: 0, reasons: ['Company not found in your list'] }

    const topics = await DSATopic.find({ userId, deletedAt: null }).select('topic mastery').lean()
    const interviews = await Interview.find({ userId, deletedAt: null, company: new RegExp(companyName, 'i') })
      .select('result feedback')
      .lean()

    const score = this._calculateReadinessScore(company, topics, interviews)
    const reasons = this._generateReadinessReasons(company, topics, interviews)

    return { ready: score >= 60, score, reasons, company: company.name }
  }

  _calculateReadinessScore(company, topics, interviews) {
    let score = 0
    const stats = company.stats || {}
    if (stats.interviews > 0) score += 20
    if (stats.offers > 0) score += 30
    if (interviews.some((i) => i.result === 'pass')) score += 20
    const avgMastery = topics.length > 0 ? topics.reduce((s, t) => s + t.mastery, 0) / topics.length : 0
    score += Math.min(30, Math.round(avgMastery / 100 * 30))
    return Math.min(100, score)
  }

  _generateReadinessReasons(company, topics, interviews) {
    const reasons = []
    const stats = company.stats || {}
    if (stats.offers > 0) reasons.push('You have received offers from this company')
    if (interviews.some((i) => i.result === 'pass')) reasons.push('Past interview success detected')
    if (stats.interviews > 0) reasons.push(`You have ${stats.interviews} interviews recorded`)
    const avgMastery = topics.length > 0 ? topics.reduce((s, t) => s + t.mastery, 0) / topics.length : 0
    if (avgMastery < 50) reasons.push('Topic mastery needs improvement')
    if (reasons.length === 0) reasons.push('Start preparing by solving company-specific problems')
    return reasons
  }

  async getRecommendedProblems(userId, topics, limit = 10) {
    const topicList = topics ? topics.split(',').map((t) => t.trim()) : []
    const weakTopics = topicList.length > 0
      ? topicList
      : await DSATopic.find({ userId, deletedAt: null, mastery: { $lt: 50 } })
          .sort({ mastery: 1 })
          .limit(5)
          .select('topic')
          .lean()
          .then((t) => t.map((x) => x.topic))

    const problems = await DSAProblem.find({
      userId,
      deletedAt: null,
      status: { $in: ['not_started', 'started'] },
      topic: { $in: weakTopics },
    })
      .sort({ difficulty: 1, createdAt: 1 })
      .limit(limit)
      .select('title topic difficulty platform status')
      .lean()

    return problems.map((p) => ({
      id: p._id,
      title: p.title,
      topic: p.topic,
      difficulty: p.difficulty,
      platform: p.platform,
      status: p.status,
    }))
  }

  // ── Planner Analytics ────────────────────────────────────────────────────

  async getPlannerOverview(userId) {
    const [completionRate, totalTasks, completedToday, overdueCount, activeHabits, activeGoals] = await Promise.all([
      this.getPlannerCompletionRate(userId, 30),
      PlannerTask.countDocuments({ userId, deletedAt: null }),
      this.getPlannerCompletedToday(userId),
      PlannerTask.countDocuments({ userId, deletedAt: null, status: 'overdue' }),
      PlannerHabit.countDocuments({ userId, deletedAt: null, active: true }),
      Goal.countDocuments({ userId, deletedAt: null, status: 'active' }),
    ])

    return {
      completionRate,
      totalTasks,
      completedToday,
      overdueCount,
      activeHabits,
      activeGoals,
    }
  }

  async getPlannerAnalytics(userId) {
    const [
      completionRate,
      productivityTrends,
      categoryDistribution,
      weeklyReport,
    ] = await Promise.all([
      this.getPlannerCompletionRate(userId, 30),
      this.getPlannerProductivityTrends(userId, 12),
      this.getPlannerCategoryDistribution(userId),
      this.getPlannerWeeklyReport(userId),
    ])

    return {
      completionRate,
      productivityTrends,
      categoryDistribution,
      weeklyReport,
    }
  }

  async getPlannerCompletionRate(userId, days = 30) {
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

  async getPlannerProductivityTrends(userId, weeks = 12) {
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
        completed,
        created,
        rate: created > 0 ? Math.round((completed / created) * 100) : 0,
      })
    }

    return data
  }

  async getPlannerCategoryDistribution(userId) {
    return PlannerTask.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
    ])
  }

  async getPlannerWeeklyReport(userId) {
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
      this.getPlannerCategoryDistribution(userId),
      PlannerTask.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null, createdAt: { $gte: weekStart, $lt: weekEnd } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ])

    const total = tasks.length
    const totalTime = tasks.reduce((sum, t) => sum + (t.actualTime || t.estimatedTime || 0), 0)

    return {
      total,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalTime,
      byCategory,
      byPriority,
    }
  }

  async getPlannerCompletedToday(userId) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return PlannerTask.countDocuments({
      userId,
      deletedAt: null,
      status: 'completed',
      completedDate: { $gte: today, $lt: tomorrow },
    })
  }

  // ── Cross-Module Insights ────────────────────────────────────────────────

  async getInsights(userId) {
    const [readiness, applicationStats, interviewStats, dsaStats, plannerStats, upcomingInterviews] = await Promise.all([
      this.getReadinessScore(userId),
      this.getApplicationStats(userId),
      this.getInterviewStats(userId),
      this.getDsaOverview(userId),
      this.getPlannerOverview(userId),
      Interview.find({ userId, deletedAt: null, status: { $in: ['scheduled', 'rescheduled'] } })
        .sort({ scheduledDate: 1 })
        .limit(5)
        .select('company type scheduledDate')
        .lean(),
    ])

    const insights = []

    if (dsaStats.totalSolved > 50 && applicationStats.total < 3) {
      insights.push({
        type: 'opportunity',
        title: 'DSA strength unused',
        message: `You have solved ${dsaStats.totalSolved} problems but only applied to ${applicationStats.total} companies. Start applying more.`,
        priority: 'high',
      })
    }

    if (upcomingInterviews.length >= 3) {
      insights.push({
        type: 'warning',
        title: 'Interview week ahead',
        message: `You have ${upcomingInterviews.length} interviews scheduled. Ensure your planner and DSA revision are on track.`,
        priority: 'high',
      })
    }

    if (dsaStats.revisionStats?.pending > 0) {
      insights.push({
        type: 'action',
        title: 'Pending DSA revisions',
        message: `You have ${dsaStats.revisionStats.pending} DSA revisions pending. Complete them to maintain knowledge retention.`,
        priority: 'medium',
      })
    }

    if (plannerStats.overdueCount > 0) {
      insights.push({
        type: 'warning',
        title: 'Overdue tasks',
        message: `You have ${plannerStats.overdueCount} overdue tasks. Reschedule or complete them to stay on track.`,
        priority: 'medium',
      })
    }

    if (interviewStats.passRate > 70) {
      insights.push({
        type: 'success',
        title: 'Strong interview performance',
        message: `Your interview pass rate is ${interviewStats.passRate}%. Keep up the great work!`,
        priority: 'low',
      })
    }

    if (applicationStats.offers > 0 && applicationStats.total > 0) {
      const offerRate = Math.round((applicationStats.offers / applicationStats.total) * 100)
      insights.push({
        type: 'success',
        title: 'Offer progress',
        message: `You have received ${applicationStats.offers} offers from ${applicationStats.total} applications (${offerRate}% rate).`,
        priority: 'low',
      })
    }

    return insights
  }

  // ── Recommendations ──────────────────────────────────────────────────────

  async getRecommendations(userId) {
    const [weakTopics, upcomingInterviews, pendingRevisions, upcomingDeadlines] = await Promise.all([
      this.getWeakTopics(userId),
      Interview.find({ userId, deletedAt: null, status: { $in: ['scheduled', 'rescheduled'] } })
        .sort({ scheduledDate: 1 })
        .limit(3)
        .select('company type scheduledDate')
        .lean(),
      DSARevision.find({ userId, deletedAt: null, status: 'pending' })
        .sort({ dueDate: 1 })
        .limit(5)
        .select('problemTitle dueDate')
        .lean(),
      this.getUpcomingDeadlines(userId),
    ])

    const recommendations = []

    if (weakTopics.length > 0) {
      recommendations.push({
        type: 'dsa',
        title: 'Review weak topics',
        description: `Focus on ${weakTopics[0].topic} (mastery: ${weakTopics[0].mastery}%)`,
        action: 'Practice problems',
        priority: 'high',
      })
    }

    if (upcomingInterviews.length > 0) {
      const nextInterview = upcomingInterviews[0]
      recommendations.push({
        type: 'interview',
        title: 'Prepare for upcoming interview',
        description: `${nextInterview.company} - ${nextInterview.type.replace(/_/g, ' ')} on ${new Date(nextInterview.scheduledDate).toLocaleDateString()}`,
        action: 'Review preparation',
        priority: 'high',
      })
    }

    if (pendingRevisions.length > 0) {
      recommendations.push({
        type: 'revision',
        title: 'Complete pending revisions',
        description: `${pendingRevisions.length} revisions due. Next: ${pendingRevisions[0].problemTitle}`,
        action: 'Revise now',
        priority: 'medium',
      })
    }

    if (upcomingDeadlines.length > 0) {
      recommendations.push({
        type: 'application',
        title: 'Upcoming deadline',
        description: `${upcomingDeadlines[0].company} deadline on ${new Date(upcomingDeadlines[0].deadline).toLocaleDateString()}`,
        action: 'Prepare application',
        priority: 'high',
      })
    }

    const totalSolved = await DSAProblem.countDocuments({ userId, deletedAt: null })
    if (totalSolved < 20) {
      recommendations.push({
        type: 'dsa',
        title: 'Build DSA foundation',
        description: 'Solve at least 20 problems to build a strong foundation',
        action: 'Start solving',
        priority: 'medium',
      })
    }

    return recommendations.slice(0, 6)
  }

  // ── Reports ──────────────────────────────────────────────────────────────

  async getWeeklyReport(userId) {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const [
      applications,
      interviews,
      dsaProblems,
      tasks,
      insights,
      recommendations,
    ] = await Promise.all([
      Application.countDocuments({ userId, appliedDate: { $gte: weekStart, $lt: weekEnd }, deletedAt: null }),
      Interview.countDocuments({ userId, scheduledDate: { $gte: weekStart, $lt: weekEnd }, deletedAt: null }),
      DSAProblem.countDocuments({ userId, solvedAt: { $gte: weekStart, $lt: weekEnd }, deletedAt: null }),
      PlannerTask.countDocuments({ userId, createdAt: { $gte: weekStart, $lt: weekEnd }, deletedAt: null }),
      this.getInsights(userId),
      this.getRecommendations(userId),
    ])

    return {
      period: {
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
      },
      summary: {
        applications,
        interviews,
        dsaProblems,
        tasks,
      },
      insights,
      recommendations,
      generatedAt: new Date().toISOString(),
    }
  }

  async getMonthlyReport(userId) {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const [
      applications,
      interviews,
      dsaProblems,
      tasks,
      insights,
      recommendations,
    ] = await Promise.all([
      Application.countDocuments({ userId, appliedDate: { $gte: monthStart, $lt: monthEnd }, deletedAt: null }),
      Interview.countDocuments({ userId, scheduledDate: { $gte: monthStart, $lt: monthEnd }, deletedAt: null }),
      DSAProblem.countDocuments({ userId, solvedAt: { $gte: monthStart, $lt: monthEnd }, deletedAt: null }),
      PlannerTask.countDocuments({ userId, createdAt: { $gte: monthStart, $lt: monthEnd }, deletedAt: null }),
      this.getInsights(userId),
      this.getRecommendations(userId),
    ])

    return {
      period: {
        start: monthStart.toISOString(),
        end: monthEnd.toISOString(),
      },
      summary: {
        applications,
        interviews,
        dsaProblems,
        tasks,
      },
      insights,
      recommendations,
      generatedAt: new Date().toISOString(),
    }
  }

  async getPlacementReport(userId) {
    const [readiness, applicationStats, interviewStats, dsaStats, plannerStats, insights, recommendations] = await Promise.all([
      this.getReadinessScore(userId),
      this.getApplicationStats(userId),
      this.getInterviewStats(userId),
      this.getDsaOverview(userId),
      this.getPlannerOverview(userId),
      this.getInsights(userId),
      this.getRecommendations(userId),
    ])

    return {
      readiness,
      applications: applicationStats,
      interviews: interviewStats,
      dsa: dsaStats,
      planner: plannerStats,
      insights,
      recommendations,
      generatedAt: new Date().toISOString(),
    }
  }

  // ── Shared Utilities ─────────────────────────────────────────────────────

  async getWeeklyTrend(userId, weeks = 12) {
    const data = []
    const now = new Date()

    for (let i = weeks; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - (i * 7))
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)

      const [problems, interviews, applications] = await Promise.all([
        DSAProblem.countDocuments({
          userId,
          solvedAt: { $gte: weekStart, $lt: weekEnd },
          deletedAt: null,
        }),
        Interview.countDocuments({
          userId,
          scheduledDate: { $gte: weekStart, $lt: weekEnd },
          deletedAt: null,
        }),
        Application.countDocuments({
          userId,
          appliedDate: { $gte: weekStart, $lt: weekEnd },
          deletedAt: null,
        }),
      ])

      data.push({
        week: weeks - i,
        problems,
        interviews,
        applications,
      })
    }

    return data
  }

  async getHeatmapData(userId, days = 84) {
    const data = []
    const now = new Date()

    for (let i = days; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)

      const problems = await DSAProblem.countDocuments({
        userId,
        solvedAt: { $gte: date, $lt: nextDate },
        deletedAt: null,
      })

      const intensity = problems === 0 ? 0 : Math.min(Math.ceil(problems / 2), 4)
      data.push(intensity)
    }

    return data
  }

  async getStreak(userId) {
    const problems = await DSAProblem.find({ userId, deletedAt: null })
      .sort({ solvedAt: -1 })
      .select('solvedAt')

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

  async getMonthlySolved(userId) {
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    return DSAProblem.countDocuments({
      userId,
      solvedAt: { $gte: monthStart },
      deletedAt: null,
    })
  }

  async getUpcomingDeadlines(userId, limit = 5) {
    const now = new Date()
    const nextWeek = new Date(now)
    nextWeek.setDate(now.getDate() + 7)

    const [applications, interviews] = await Promise.all([
      Application.find({
        userId,
        deletedAt: null,
        deadline: { $gte: now, $lte: nextWeek },
      })
        .sort({ deadline: 1 })
        .limit(limit)
        .select('company role deadline')
        .lean(),
      Interview.find({
        userId,
        deletedAt: null,
        scheduledDate: { $gte: now, $lte: nextWeek },
        status: { $in: ['scheduled', 'rescheduled'] },
      })
        .sort({ scheduledDate: 1 })
        .limit(limit)
        .select('company role type scheduledDate')
        .lean(),
    ])

    const deadlines = [
      ...applications.map((a) => ({
        type: 'application',
        company: a.company,
        description: a.role,
        deadline: a.deadline,
        id: a._id,
      })),
      ...interviews.map((i) => ({
        type: 'interview',
        company: i.company,
        description: `${i.type.replace(/_/g, ' ')} - ${i.role}`,
        deadline: i.scheduledDate,
        id: i._id,
      })),
    ]

    return deadlines.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, limit)
  }
}
