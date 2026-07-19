import { AnalyticsService } from '../services/analytics.service.js'
import { CompanyRepository } from '../repositories/company.repository.js'
import { InterviewRepository } from '../repositories/interview.repository.js'
import { DSARepository } from '../repositories/dsa.repository.js'
import { NotificationRepository } from '../repositories/notification.repository.js'
import { PlannerRepository } from '../repositories/planner.repository.js'
import { GoalRepository } from '../repositories/goal.repository.js'
import { UserRepository } from '../repositories/user.repository.js'
import { DSAService } from '../services/dsa.service.js'
import { PlannerService } from '../services/planner.service.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'
import mongoose from 'mongoose'

const analyticsService = new AnalyticsService()
const companyRepo = new CompanyRepository()
const interviewRepo = new InterviewRepository()
const dsaRepo = new DSARepository()
const dsaService = new DSAService()
const notificationRepo = new NotificationRepository()
const plannerRepo = new PlannerRepository()
const plannerService = new PlannerService()
const goalRepo = new GoalRepository()
const userRepo = new UserRepository()

// GET /dashboard/overview - Unified endpoint for initial render
const overviewCache = new Map()
export const getDashboardOverview = asyncWrapper(async (req, res) => {
  const userId = req.user._id
  const cacheKey = `${userId}:overview`
  const cached = overviewCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < 5000) {
    return res.json(cached.payload)
  }

  const [
    user,
    readiness,
    applicationStats,
    companies,
    interviews,
    notifications,
    dsaStats,
    todayTasks,
    goals,
    streak,
    heatmap,
    weeklyTrend,
    onboardingStatus
  ] = await Promise.all([
    userRepo.findById(userId),
    analyticsService.getReadinessScore(userId),
    analyticsService.getApplicationStats(userId),
    companyRepo.findAll(userId),
    interviewRepo.getUpcomingInterviews(userId, 10),
    notificationRepo.findUnread(userId),
    dsaService.getStats(userId),
    plannerService.getTodayFocus(userId),
    goalRepo.findActive(userId),
    analyticsService.getStreak(userId),
    analyticsService.getHeatmapData(userId, 84),
    analyticsService.getWeeklyTrend(userId, 4),
    userRepo.getOnboardingStatus(userId),
  ])

  const companiesList = companies?.companies || companies || []
  const activeCompanies = companiesList.filter((c) => c.status !== 'closed')
  const hotCompanies = activeCompanies.filter((c) => c.status === 'hot' || c.status === 'offer')
  const upcomingInterviews = interviews?.filter((i) => i.status === 'upcoming') || []
  
  // Generate Today's Focus recommendations
  const todayFocus = generateTodayFocus({
    hasCompanies: activeCompanies.length > 0,
    hasDsa: dsaStats.totalSolved > 0,
    hasGoals: goals.length > 0,
    hasPlanner: todayTasks.tasks?.length > 0,
    readiness,
    hotCompanies,
    upcomingInterviews,
    weakTopics: dsaStats.weakTopics || [],
  })

  // Recent activity feed
  const recentActivity = await generateRecentActivity(userId, companiesList, interviews, goals, todayTasks.tasks, notifications)
  
  // Calculate additional stats for coding consistency
  const codingStats = {
    currentStreak: streak || 0,
    longestStreak: await analyticsService.getLongestStreak(userId),
    weeklySolved: dsaStats.weeklySolved || 0,
    monthlySolved: await analyticsService.getMonthlySolved(userId),
    totalSolved: dsaStats.totalSolved || 0,
  }

  const payload = {
    success: true,
    message: 'Dashboard overview retrieved',
    data: {
      user: {
        name: user.name,
        email: user.email,
        onboarding: onboardingStatus,
      },
      readiness,
      applicationStats,
      companies: activeCompanies,
      hotCompanies,
      interviews: upcomingInterviews,
      notifications,
      todayFocus,
      dsaStats: {
        totalSolved: dsaStats.totalSolved || 0,
        weeklySolved: dsaStats.weeklySolved || 0,
        weeklyDelta: dsaStats.weeklyDelta || 0,
        weakTopics: dsaStats.weakTopics || [],
      },
      streak: streak || 0,
      codingStats,
      heatmap: heatmap || [],
      weeklyTrend: weeklyTrend || [],
      goals: goals.slice(0, 5),
      recentActivity,
      stats: {
        applications: applicationStats.total || 0,
        interviews: upcomingInterviews.length,
        offers: applicationStats.offers || 0,
        rejections: applicationStats.rejected || 0,
        problemsSolved: dsaStats.totalSolved || 0,
        goalsCompleted: goals.filter(g => g.progress === 100).length,
        tasksCompleted: todayTasks.tasks.filter(t => t.done).length,
      }
    },
  }

  overviewCache.set(cacheKey, { ts: Date.now(), payload })
  res.json(payload)
})

// GET /dashboard/activity - Recent activity feed
export const getDashboardActivity = asyncWrapper(async (req, res) => {
  const userId = req.user._id
  const limit = parseInt(req.query.limit) || 20

  const [companies, interviews, goals, plannerTasks, notifications] = await Promise.all([
    companyRepo.findRecent(userId, limit),
    interviewRepo.getPastInterviews(userId, limit),
    goalRepo.findRecent(userId, limit),
    plannerService.findRecent(userId, limit),
    notificationRepo.findRecent(userId, limit),
  ])

  const activity = await generateRecentActivity(userId, companies, interviews, goals, plannerTasks, notifications, limit)

  res.json({
    success: true,
    message: 'Activity feed retrieved',
    data: { activity },
  })
})

// GET /dashboard/readiness - Detailed readiness breakdown
export const getDashboardReadiness = asyncWrapper(async (req, res) => {
  const userId = req.user._id
  
  const [readiness, breakdown] = await Promise.all([
    analyticsService.getReadinessScore(userId),
    analyticsService.getReadinessBreakdown(userId),
  ])

  res.json({
    success: true,
    message: 'Readiness data retrieved',
    data: { readiness, breakdown },
  })
})

// GET /dashboard/focus - Today's focus recommendations
export const getDashboardFocus = asyncWrapper(async (req, res) => {
  const userId = req.user._id

  const [
    companies,
    dsaStats,
    goals,
    todayTasks,
    upcomingInterviews,
    weakTopics
  ] = await Promise.all([
    companyRepo.findAll(userId),
    dsaService.getStats(userId),
    goalRepo.findActive(userId),
    plannerService.getTodayFocus(userId),
    interviewRepo.getUpcomingInterviews(userId, 10),
    dsaService.getWeakTopics(userId, 3),
  ])

  const companiesList = companies?.companies || companies || []
  const activeCompanies = companiesList.filter((c) => c.status !== 'closed')
  const readiness = await analyticsService.getReadinessScore(userId)

  const todayFocus = generateTodayFocus({
    hasCompanies: activeCompanies.length > 0,
    hasDsa: dsaStats.totalSolved > 0,
    hasGoals: goals.length > 0,
    hasPlanner: todayTasks.tasks?.length > 0,
    readiness,
    hotCompanies: activeCompanies.filter(c => c.status === 'hot' || c.status === 'offer'),
    upcomingInterviews,
    weakTopics: weakTopics || [],
  })

  res.json({
    success: true,
    message: 'Today\'s focus retrieved',
    data: { focus: todayFocus },
  })
})

// GET /dashboard/quick-actions - Available quick actions based on user state
export const getDashboardQuickActions = asyncWrapper(async (req, res) => {
  const userId = req.user._id

  const [
    companies,
    dsaStats,
    goals,
    hasProfile
  ] = await Promise.all([
    companyRepo.findAll(userId),
    dsaService.getStats(userId),
    goalRepo.findActive(userId),
    userRepo.hasCompleteProfile(userId),
  ])

  const companiesList = companies?.companies || companies || []
  const activeCompanies = companiesList.filter((c) => c.status !== 'closed')
  const actions = [
    { id: 'add-application', label: 'Add Application', icon: '📋', available: true, route: '/app/applications' },
    { id: 'log-dsa', label: 'Log DSA Problem', icon: '🧮', available: true, route: '/app/dsa' },
    { id: 'add-planner-task', label: 'Add Planner Task', icon: '📅', available: true, route: '/app/planner' },
    { id: 'create-goal', label: 'Create Goal', icon: '🎯', available: true, route: '/app/goals' },
    { id: 'schedule-interview', label: 'Schedule Interview', icon: '🎯', available: activeCompanies.length > 0, route: '/app/interviews' },
    { id: 'update-profile', label: 'Update Profile', icon: '👤', available: !hasProfile, route: '/app/profile' },
  ].filter(a => a.available)

  res.json({
    success: true,
    message: 'Quick actions retrieved',
    data: { actions },
  })
})

// Helper function to generate Today's Focus recommendations
function generateTodayFocus(context) {
  const focus = []
  const { hasCompanies, hasDsa, hasGoals, hasPlanner, readiness, hotCompanies, upcomingInterviews, weakTopics } = context

  // Always prioritize based on readiness and gaps
  if (readiness.overall < 30) {
    focus.push({
      id: 'boost-readiness',
      title: 'Complete your profile',
      description: 'A complete profile increases your visibility to recruiters',
      priority: 'high',
      action: 'update-profile',
    })
  }

  if (!hasCompanies) {
    focus.push({
      id: 'first-application',
      title: 'Create your first application',
      description: 'Start tracking companies you want to apply to',
      priority: 'high',
      action: 'add-application',
    })
  }

  if (!hasDsa) {
    focus.push({
      id: 'first-dsa',
      title: 'Complete your first DSA problem',
      description: 'Start building your coding consistency',
      priority: 'high',
      action: 'log-dsa',
    })
  }

  if (!hasGoals) {
    focus.push({
      id: 'first-goal',
      title: 'Create your first goal',
      description: 'Set measurable targets for your placement journey',
      priority: 'medium',
      action: 'create-goal',
    })
  }

  if (!hasPlanner) {
    focus.push({
      id: 'first-planner',
      title: 'Add your first planner task',
      description: 'Organize your daily preparation schedule',
      priority: 'medium',
      action: 'add-planner-task',
    })
  }

  // Contextual recommendations
  if (hotCompanies.length > 0) {
    focus.push({
      id: 'hot-leads',
      title: `Follow up on ${hotCompanies.length} hot lead${hotCompanies.length > 1 ? 's' : ''}`,
      description: 'You have companies with active status - check for updates',
      priority: 'high',
      action: 'view-applications',
    })
  }

  if (upcomingInterviews.length > 0) {
    const nextInterview = upcomingInterviews[0]
    focus.push({
      id: 'upcoming-interview',
      title: `Prepare for ${nextInterview.company} interview`,
      description: `${nextInterview.round} scheduled - review key concepts`,
      priority: 'high',
      action: 'prepare-interview',
    })
  }

  if (weakTopics.length > 0) {
    const topWeak = weakTopics[0]
    focus.push({
      id: 'weak-topic',
      title: `Practice ${topWeak.topic} problems`,
      description: `Your mastery is at ${topWeak.mastery}% - improve with practice`,
      priority: 'medium',
      action: 'practice-topic',
    })
  }

  if (readiness.coding < 50 && hasDsa) {
    focus.push({
      id: 'coding-practice',
      title: 'Solve 2-3 coding problems today',
      description: 'Boost your coding readiness with consistent practice',
      priority: 'medium',
      action: 'log-dsa',
    })
  }

  if (readiness.goalReadiness < 50 && hasGoals) {
    focus.push({
      id: 'goal-progress',
      title: 'Update your goal progress',
      description: 'Track your advancement towards placement targets',
      priority: 'medium',
      action: 'update-goals',
    })
  }

  // Limit to top 4 recommendations
  return focus.slice(0, 4)
}

// Helper function to generate recent activity feed
async function generateRecentActivity(userId, companies, interviews, goals, plannerTasks, notifications, limit = 10) {
  const activities = []

  // Add company activities
  companies.slice(0, 5).forEach(company => {
    activities.push({
      id: `company-${company._id}`,
      type: 'application',
      title: `Added ${company.name} application`,
      description: `${company.role} · ${company.stage}`,
      timestamp: company.createdAt,
      icon: '📋',
    })
  })

  // Add interview activities
  interviews.slice(0, 5).forEach(interview => {
    activities.push({
      id: `interview-${interview._id}`,
      type: 'interview',
      title: `Interview scheduled with ${interview.company}`,
      description: `${interview.round} · ${interview.when}`,
      timestamp: interview.createdAt,
      icon: '🎯',
    })
  })

  // Add goal activities
  goals.slice(0, 5).forEach(goal => {
    activities.push({
      id: `goal-${goal._id}`,
      type: 'goal',
      title: goal.progress === 100 ? 'Goal completed' : 'Goal created',
      description: goal.title,
      timestamp: goal.createdAt,
      icon: '🎯',
    })
  })

  // Add planner activities
  plannerTasks.slice(0, 5).forEach(task => {
    activities.push({
      id: `task-${task._id}`,
      type: 'planner',
      title: task.done ? 'Completed planner task' : 'Added planner task',
      description: task.title,
      timestamp: task.createdAt,
      icon: '📅',
    })
  })

  // Add notification activities
  notifications.slice(0, 5).forEach(notification => {
    activities.push({
      id: `notification-${notification._id}`,
      type: 'notification',
      title: notification.title,
      description: notification.message || '',
      timestamp: notification.createdAt,
      icon: '🔔',
    })
  })

  // Sort by timestamp descending
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  // Format timestamps and limit
  return activities.slice(0, limit).map(activity => ({
    ...activity,
    timestamp: formatActivityTime(activity.timestamp),
  }))
}

function formatActivityTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}