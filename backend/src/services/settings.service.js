import { User } from '../models/user.model.js'
import { Company } from '../models/company.model.js'
import { Interview } from '../models/interview.model.js'
import { Application } from '../models/application.model.js'
import { DSAProblem, DSATopic } from '../models/dsa.model.js'
import { Goal } from '../models/goal.model.js'
import { PlannerTask } from '../models/planner.model.js'
import { Achievement } from '../models/achievement.model.js'
import mongoose from 'mongoose'

export class SettingsService {
  // ── Account ──────────────────────────────────────────────────────────────

  async getSettings(userId) {
    const user = await User.findById(userId).select('-password -refreshToken -passwordResetToken')
    if (!user) throw new Error('User not found')
    return user
  }

  async updateSettings(userId, data) {
    const allowedFields = [
      'name', 'email', 'username', 'season', 'school', 'program', 'location', 'timezone',
      'headline', 'bio', 'phone', 'college', 'degree', 'branch', 'semester',
      'graduationYear', 'skills', 'interests', 'languages', 'publicLinks', 'profilePhoto', 'banner',
    ]
    const update = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) update[field] = data[field]
    }
    return User.findByIdAndUpdate(userId, update, { new: true, runValidators: true }).select('-password -refreshToken -passwordResetToken')
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password')
    if (!user) throw new Error('User not found')
    const valid = await user.comparePassword(currentPassword)
    if (!valid) throw new Error('Current password is incorrect')
    user.password = newPassword
    await user.save()
    return { success: true }
  }

  async getSessions(userId) {
    const user = await User.findById(userId).select('refreshToken refreshTokenExpires')
    if (!user) return []
    const sessions = []
    if (user.refreshToken) {
      sessions.push({
        id: 'current',
        device: 'Current session',
        browser: 'Unknown',
        location: 'Unknown',
        lastActive: user.refreshTokenExpires || new Date(),
        current: true,
      })
    }
    return sessions
  }

  async revokeSessions(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null, refreshTokenExpires: null })
    return { success: true }
  }

  async deleteAccount(userId) {
    await User.findByIdAndUpdate(userId, { deletedAt: new Date() })
    return { success: true }
  }

  // ── Appearance ───────────────────────────────────────────────────────────

  async updateAppearance(userId, data) {
    const allowedFields = ['theme', 'fontSize', 'density', 'sidebarCollapsed', 'animationsEnabled', 'reducedMotion']
    const update = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) update[field] = data[field]
    }
    return User.findByIdAndUpdate(userId, update, { new: true, runValidators: true }).select('-password -refreshToken -passwordResetToken')
  }

  // ── Notifications ────────────────────────────────────────────────────────

  async updateNotificationPreferences(userId, preferences) {
    const validKeys = ['interviews', 'weekly', 'problems', 'deadlines', 'marketing', 'achievements', 'reports', 'reminders', 'email', 'push', 'inApp', 'digestFrequency', 'quietHours']
    const update = {}
    for (const key of validKeys) {
      if (preferences[key] !== undefined) update[`notificationPreferences.${key}`] = preferences[key]
    }
    return User.findByIdAndUpdate(userId, update, { new: true, runValidators: true }).select('-password -refreshToken -passwordResetToken')
  }

  // ── Privacy ──────────────────────────────────────────────────────────────

  async updatePrivacySettings(userId, data) {
    const allowedFields = ['publicProfile', 'activityVisibility', 'achievementVisibility', 'documentVisibility', 'analyticsSharing', 'dataProcessing']
    const update = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) update[field] = data[field]
    }
    return User.findByIdAndUpdate(userId, update, { new: true, runValidators: true }).select('-password -refreshToken -passwordResetToken')
  }

  // ── Security ─────────────────────────────────────────────────────────────

  async updateSecuritySettings(userId, data) {
    const allowedFields = ['twoFactorEnabled', 'recoveryEmail', 'securityNotifications']
    const update = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) update[field] = data[field]
    }
    return User.findByIdAndUpdate(userId, update, { new: true, runValidators: true }).select('-password -refreshToken -passwordResetToken')
  }

  async getLoginHistory(userId) {
    return []
  }

  async getSecurityLog(userId) {
    return []
  }

  // ── Productivity ─────────────────────────────────────────────────────────

  async updateProductivitySettings(userId, data) {
    const allowedFields = ['defaultPlannerView', 'defaultAnalyticsTab', 'defaultDashboardWidgets', 'defaultCalendarView', 'autoCreatePlannerTasks', 'autoCreateInterviewPlans', 'dsaReminderFrequency', 'startPage']
    const update = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) update[field] = data[field]
    }
    return User.findByIdAndUpdate(userId, update, { new: true, runValidators: true }).select('-password -refreshToken -passwordResetToken')
  }

  // ── Integrations ──────────────────────────────────────────────────────────

  async getIntegrations(userId) {
    const user = await User.findById(userId).select('integrations')
    return user?.integrations || {}
  }

  async updateIntegration(userId, key, data) {
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')
    user.integrations = user.integrations || {}
    user.integrations[key] = { ...user.integrations[key], ...data, updatedAt: new Date() }
    await user.save()
    return user.integrations[key]
  }

  async disconnectIntegration(userId, key) {
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')
    user.integrations = user.integrations || {}
    delete user.integrations[key]
    await user.save()
    return { success: true }
  }

  // ── Data Management ──────────────────────────────────────────────────────

  async exportAllData(userId) {
    const [
      user,
      companies,
      interviews,
      applications,
      dsaProblems,
      dsaTopics,
      goals,
      plannerTasks,
      achievements,
    ] = await Promise.all([
      User.findById(userId).select('-password -refreshToken -passwordResetToken'),
      Company.find({ userId, deletedAt: null }),
      Interview.find({ userId, deletedAt: null }),
      Application.find({ userId, deletedAt: null }),
      DSAProblem.find({ userId, deletedAt: null }),
      DSATopic.find({ userId, deletedAt: null }),
      Goal.find({ userId, deletedAt: null }),
      PlannerTask.find({ userId, deletedAt: null }),
      Achievement.find({ userId, deletedAt: null }),
    ])

    return {
      user,
      companies,
      interviews,
      applications,
      dsa: { problems: dsaProblems, topics: dsaTopics },
      goals,
      planner: { tasks: plannerTasks },
      achievements,
      exportedAt: new Date().toISOString(),
    }
  }

  async clearCache() {
    return { success: true }
  }

  async resetPreferences(userId) {
    return User.findByIdAndUpdate(
      userId,
      {
        theme: 'dark',
        fontSize: 'medium',
        density: 'comfortable',
        sidebarCollapsed: false,
        animationsEnabled: true,
        reducedMotion: false,
        notificationPreferences: {
          interviews: true,
          weekly: true,
          problems: false,
          deadlines: true,
          marketing: false,
        },
        defaultPlannerView: 'list',
        defaultAnalyticsTab: 'overview',
        startPage: 'dashboard',
      },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -passwordResetToken')
  }

  async deleteArchivedData(userId) {
    const now = new Date()
    await Promise.all([
      Company.deleteMany({ userId, deletedAt: { $exists: true, $ne: null } }),
      Interview.deleteMany({ userId, deletedAt: { $exists: true, $ne: null } }),
      Achievement.deleteMany({ userId, deletedAt: { $exists: true, $ne: null } }),
    ])
    return { success: true }
  }
}
