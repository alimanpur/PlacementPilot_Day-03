import { User } from '../models/user.model.js'
import { Company } from '../models/company.model.js'
import { Interview } from '../models/interview.model.js'
import { Application } from '../models/application.model.js'
import { DSAProblem, DSATopic } from '../models/dsa.model.js'
import { Goal } from '../models/goal.model.js'
import { PlannerTask, PlannerHabit } from '../models/planner.model.js'
import { Achievement } from '../models/achievement.model.js'
import { Document } from '../models/document.model.js'
import { Skill } from '../models/skill.model.js'
import mongoose from 'mongoose'

export class ProfileService {
  constructor() {
    this.achievementDefinitions = [
      { key: 'first_application', title: 'First Application', description: 'Submit your first job application', icon: '📝', category: 'applications', module: 'applications', field: 'total', target: 1, tier: 'bronze' },
      { key: 'ten_applications', title: 'Ten Applications', description: 'Submit 10 job applications', icon: '📊', category: 'applications', module: 'applications', field: 'total', target: 10, tier: 'silver' },
      { key: 'fifty_applications', title: 'Fifty Applications', description: 'Submit 50 job applications', icon: '🎯', category: 'applications', module: 'applications', field: 'total', target: 50, tier: 'gold' },
      { key: 'first_interview', title: 'First Interview', description: 'Complete your first interview', icon: '🎤', category: 'interviews', module: 'interviews', field: 'total', target: 1, tier: 'bronze' },
      { key: 'ten_interviews', title: 'Ten Interviews', description: 'Complete 10 interviews', icon: '🎙️', category: 'interviews', module: 'interviews', field: 'total', target: 10, tier: 'silver' },
      { key: 'first_offer', title: 'First Offer', description: 'Receive your first job offer', icon: '🎉', category: 'interviews', module: 'interviews', field: 'offers', target: 1, tier: 'gold' },
      { key: 'ten_problems', title: '10 Problems Solved', description: 'Solve 10 DSA problems', icon: '💻', category: 'dsa', module: 'dsa', field: 'solved', target: 10, tier: 'bronze' },
      { key: 'fifty_problems', title: '50 Problems Solved', description: 'Solve 50 DSA problems', icon: '⚡', category: 'dsa', module: 'dsa', field: 'solved', target: 50, tier: 'silver' },
      { key: 'hundred_problems', title: '100 Problems Solved', description: 'Solve 100 DSA problems', icon: '🏆', category: 'dsa', module: 'dsa', field: 'solved', target: 100, tier: 'gold' },
      { key: 'seven_day_streak', title: '7-Day Streak', description: 'Maintain a 7-day coding streak', icon: '🔥', category: 'dsa', module: 'dsa', field: 'streak', target: 7, tier: 'silver' },
      { key: 'thirty_day_streak', title: '30-Day Streak', description: 'Maintain a 30-day coding streak', icon: '🌟', category: 'dsa', module: 'dsa', field: 'streak', target: 30, tier: 'gold' },
      { key: 'first_task', title: 'First Task', description: 'Complete your first planner task', icon: '✅', category: 'planner', module: 'planner', field: 'tasks', target: 1, tier: 'bronze' },
      { key: 'hundred_tasks', title: 'Task Champion', description: 'Complete 100 planner tasks', icon: '👑', category: 'planner', module: 'planner', field: 'tasks', target: 100, tier: 'gold' },
      { key: 'habit_master', title: 'Habit Master', description: 'Maintain 5 active habits', icon: '💪', category: 'planner', module: 'planner', field: 'habits', target: 5, tier: 'silver' },
      { key: 'goal_setter', title: 'Goal Setter', description: 'Create 3 active goals', icon: '🎯', category: 'planner', module: 'planner', field: 'goals', target: 3, tier: 'silver' },
      { key: 'profile_complete', title: 'Profile Complete', description: 'Complete your profile', icon: '👤', category: 'profile', module: 'profile', field: 'complete', target: 1, tier: 'bronze' },
    ]
  }

  // ── Profile Summary ──────────────────────────────────────────────────────

  async getProfileSummary(userId) {
    const [user, readiness, applicationStats, interviewStats, dsaStats, plannerStats, achievements, streak] = await Promise.all([
      User.findById(userId).select('-password -refreshToken -passwordResetToken'),
      this.getReadinessScore(userId),
      this.getApplicationSummary(userId),
      this.getInterviewSummary(userId),
      this.getDSASummary(userId),
      this.getPlannerSummary(userId),
      Achievement.find({ userId, deletedAt: null }).sort({ unlockedAt: -1 }).limit(10),
      this.getStreak(userId),
    ])

    return {
      user,
      readiness,
      applications: applicationStats,
      interviews: interviewStats,
      dsa: dsaStats,
      planner: plannerStats,
      achievements: achievements.length,
      streak,
      profileCompleteness: this._calculateProfileCompleteness(user),
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

    return { overall, coding, interviewReadiness, goalReadiness, profileScore }
  }

  async getApplicationSummary(userId) {
    const [total, offers, rejected] = await Promise.all([
      Application.countDocuments({ userId, deletedAt: null }),
      Application.countDocuments({ userId, deletedAt: null, currentStage: 'accepted' }),
      Application.countDocuments({ userId, deletedAt: null, currentStage: 'rejected' }),
    ])

    return { total, offers, rejected, acceptanceRate: total > 0 ? Math.round((offers / total) * 100) : 0 }
  }

  async getInterviewSummary(userId) {
    const [total, completed, passed] = await Promise.all([
      Interview.countDocuments({ userId, deletedAt: null }),
      Interview.countDocuments({ userId, deletedAt: null, status: 'completed' }),
      Interview.countDocuments({ userId, deletedAt: null, status: 'completed', result: 'pass' }),
    ])

    return { total, completed, passed, passRate: completed > 0 ? Math.round((passed / completed) * 100) : 0 }
  }

  async getDSASummary(userId) {
    const [totalSolved, totalProblems, avgMastery] = await Promise.all([
      DSAProblem.countDocuments({ userId, deletedAt: null, status: 'solved' }),
      DSAProblem.countDocuments({ userId, deletedAt: null }),
      this.getAverageMastery(userId),
    ])

    return { totalSolved, totalProblems, completionRate: totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0, avgMastery }
  }

  async getPlannerSummary(userId) {
    const [totalTasks, completedTasks, activeHabits, activeGoals] = await Promise.all([
      PlannerTask.countDocuments({ userId, deletedAt: null }),
      PlannerTask.countDocuments({ userId, deletedAt: null, status: 'completed' }),
      PlannerHabit.countDocuments({ userId, deletedAt: null, active: true }),
      Goal.countDocuments({ userId, deletedAt: null, status: 'active' }),
    ])

    return { totalTasks, completedTasks, activeHabits, activeGoals, completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0 }
  }

  // ── Activity Timeline ────────────────────────────────────────────────────

  async getActivityTimeline(userId, limit = 50) {
    const activities = []

    // Applications
    const recentApplications = await Application.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('company role currentStage createdAt')
      .lean()

    recentApplications.forEach(app => {
      activities.push({
        type: 'application',
        title: `Applied to ${app.company}`,
        description: app.role,
        timestamp: app.createdAt,
        icon: '📝',
      })
    })

    // Interviews
    const recentInterviews = await Interview.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('company type status result createdAt')
      .lean()

    recentInterviews.forEach(interview => {
      activities.push({
        type: 'interview',
        title: `Interview ${interview.status}`,
        description: `${interview.company} - ${interview.type.replace(/_/g, ' ')}`,
        timestamp: interview.createdAt,
        icon: interview.result === 'pass' ? '✅' : interview.result === 'fail' ? '❌' : '📅',
      })
    })

    // DSA
    const recentDSA = await DSAProblem.find({ userId, deletedAt: null, status: 'solved' })
      .sort({ solvedAt: -1 })
      .limit(10)
      .select('title topic difficulty solvedAt')
      .lean()

    recentDSA.forEach(problem => {
      activities.push({
        type: 'dsa',
        title: `Solved ${problem.title}`,
        description: `${problem.topic} · ${problem.difficulty}`,
        timestamp: problem.solvedAt,
        icon: '💻',
      })
    })

    // Planner
    const recentTasks = await PlannerTask.find({ userId, deletedAt: null, status: 'completed' })
      .sort({ completedDate: -1 })
      .limit(10)
      .select('title completedDate')
      .lean()

    recentTasks.forEach(task => {
      activities.push({
        type: 'planner',
        title: 'Completed task',
        description: task.title,
        timestamp: task.completedDate,
        icon: '✅',
      })
    })

    // Achievements
    const recentAchievements = await Achievement.find({ userId, deletedAt: null })
      .sort({ unlockedAt: -1 })
      .limit(10)
      .select('title icon unlockedAt')
      .lean()

    recentAchievements.forEach(achievement => {
      activities.push({
        type: 'achievement',
        title: `Unlocked: ${achievement.title}`,
        description: achievement.icon,
        timestamp: achievement.unlockedAt,
        icon: '🏆',
      })
    })

    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
  }

  // ── Achievements Engine ──────────────────────────────────────────────────

  async checkAchievements(userId) {
    const [applicationStats, interviewStats, dsaStats, plannerStats, profileStats, existingAchievements] = await Promise.all([
      this.getApplicationSummary(userId),
      this.getInterviewSummary(userId),
      this.getDSASummary(userId),
      this.getPlannerSummary(userId),
      this.getProfileScore(userId),
      Achievement.find({ userId, deletedAt: null }).select('title criteria'),
    ])

    const unlockedTitles = new Set(existingAchievements.map(a => a.title))
    const newAchievements = []

    const checks = [
      { key: 'first_application', current: applicationStats.total, module: 'applications', field: 'total' },
      { key: 'ten_applications', current: applicationStats.total, module: 'applications', field: 'total' },
      { key: 'fifty_applications', current: applicationStats.total, module: 'applications', field: 'total' },
      { key: 'first_interview', current: interviewStats.total, module: 'interviews', field: 'total' },
      { key: 'ten_interviews', current: interviewStats.total, module: 'interviews', field: 'total' },
      { key: 'first_offer', current: interviewStats.total, module: 'interviews', field: 'offers' },
      { key: 'ten_problems', current: dsaStats.totalSolved, module: 'dsa', field: 'solved' },
      { key: 'fifty_problems', current: dsaStats.totalSolved, module: 'dsa', field: 'solved' },
      { key: 'hundred_problems', current: dsaStats.totalSolved, module: 'dsa', field: 'solved' },
      { key: 'seven_day_streak', current: await this.getStreak(userId), module: 'dsa', field: 'streak' },
      { key: 'thirty_day_streak', current: await this.getStreak(userId), module: 'dsa', field: 'streak' },
      { key: 'first_task', current: plannerStats.completedTasks, module: 'planner', field: 'tasks' },
      { key: 'hundred_tasks', current: plannerStats.completedTasks, module: 'planner', field: 'tasks' },
      { key: 'habit_master', current: plannerStats.activeHabits, module: 'planner', field: 'habits' },
      { key: 'goal_setter', current: plannerStats.activeGoals, module: 'planner', field: 'goals' },
      { key: 'profile_complete', current: profileStats > 80 ? 1 : 0, module: 'profile', field: 'complete' },
    ]

    for (const check of checks) {
      const definition = this.achievementDefinitions.find(d => d.key === check.key)
      if (!definition) continue

      if (check.current >= definition.target && !unlockedTitles.has(definition.title)) {
        const achievement = await Achievement.create({
          userId,
          title: definition.title,
          description: definition.description,
          icon: definition.icon,
          category: definition.category,
          tier: definition.tier,
          criteria: {
            type: 'count',
            target: definition.target,
            current: check.current,
            module: definition.module,
            field: definition.field,
          },
          progress: 100,
        })

        newAchievements.push(achievement)
      }
    }

    return newAchievements
  }

  async getAchievements(userId) {
    const [unlocked, definitions] = await Promise.all([
      Achievement.find({ userId, deletedAt: null }).sort({ unlockedAt: -1 }),
      this.achievementDefinitions,
    ])

    const unlockedKeys = new Set(unlocked.map(a => a.title))

    return definitions.map(def => {
      const matching = unlocked.find(a => a.title === def.title)
      return {
        ...def,
        unlocked: !!matching,
        unlockedAt: matching?.unlockedAt,
        progress: matching ? 100 : 0,
      }
    })
  }

  // ── Documents ────────────────────────────────────────────────────────────

  async getDocuments(userId, filters = {}) {
    return Document.find({ userId, deletedAt: null, ...filters }).sort({ createdAt: -1 })
  }

  async getDocument(userId, id) {
    return Document.findOne({ _id: id, userId, deletedAt: null })
  }

  async createDocument(userId, data) {
    return Document.create({ ...data, userId })
  }

  async updateDocument(userId, id, data) {
    return Document.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      data,
      { new: true, runValidators: true }
    )
  }

  async deleteDocument(userId, id) {
    return Document.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    )
  }

  async archiveDocument(userId, id, archived = true) {
    return Document.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { archived },
      { new: true }
    )
  }

  // ── Skills ───────────────────────────────────────────────────────────────

  async getSkills(userId, filters = {}) {
    return Skill.find({ userId, deletedAt: null, ...filters }).sort({ category: 1, name: 1 })
  }

  async getSkill(userId, id) {
    return Skill.findOne({ _id: id, userId, deletedAt: null })
  }

  async createSkill(userId, data) {
    return Skill.create({ ...data, userId })
  }

  async updateSkill(userId, id, data) {
    return Skill.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      data,
      { new: true, runValidators: true }
    )
  }

  async deleteSkill(userId, id) {
    return Skill.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    )
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

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
    const user = await User.findById(userId).select('name email school program location skills publicLinks season profilePhoto headline bio phone college degree branch semester graduationYear')
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
      profilePhoto: !!user.profilePhoto,
      headline: !!user.headline,
      bio: !!user.bio,
      phone: !!user.phone,
      college: !!user.college,
      degree: !!user.degree,
    }

    const completedChecks = Object.values(checks).filter(Boolean).length
    score = (completedChecks / Object.keys(checks).length) * 100

    return Math.round(score)
  }

  _calculateProfileCompleteness(user) {
    if (!user) return 0

    const fields = [
      'name', 'email', 'school', 'program', 'location', 'skills', 'season',
      'profilePhoto', 'headline', 'bio', 'phone', 'college', 'degree'
    ]

    const filled = fields.filter(field => {
      const value = user[field]
      return value && (Array.isArray(value) ? value.length > 0 : String(value).length > 0)
    }).length

    return Math.round((filled / fields.length) * 100)
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

  async getAverageMastery(userId) {
    const topics = await DSATopic.find({ userId, deletedAt: null }).select('mastery')
    if (!topics.length) return 0
    return Math.round(topics.reduce((sum, t) => sum + t.mastery, 0) / topics.length)
  }
}
