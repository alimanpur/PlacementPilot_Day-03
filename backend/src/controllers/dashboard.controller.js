import { AnalyticsService } from '../services/analytics.service.js'
import { CompanyRepository } from '../repositories/company.repository.js'
import { InterviewRepository } from '../repositories/interview.repository.js'
import { NotificationRepository } from '../repositories/notification.repository.js'
import { GoalRepository } from '../repositories/goal.repository.js'
import { UserRepository } from '../repositories/user.repository.js'
import { DSAService } from '../services/dsa.service.js'
import { PlannerService } from '../services/planner.service.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'
import { logger } from '../lib/logger.js'
import {
  safeArray,
  safeObject,
  safeNumber,
  resolveWidgets,
} from '../lib/safeData.js'

const analyticsService = new AnalyticsService()
const companyRepo = new CompanyRepository()
const interviewRepo = new InterviewRepository()
const dsaService = new DSAService()
const notificationRepo = new NotificationRepository()
const plannerService = new PlannerService()
const goalRepo = new GoalRepository()
const userRepo = new UserRepository()

const DASHBOARD_DEFAULTS = {
  user: null,
  readiness: { overall: 0, coding: 0, interviewReadiness: 0, goalReadiness: 0, profileScore: 0 },
  applicationStats: { total: 0, offers: 0, rejected: 0, inProgress: 0, hot: 0 },
  companies: { companies: [], total: 0 },
  interviews: [],
  notifications: [],
  dsaStats: { totalSolved: 0, weeklySolved: 0, weeklyDelta: 0, weakTopics: [], difficultyBreakdown: { easy: 0, medium: 0, hard: 0 }, streak: 0, revisionQueueCount: 0, heatmap: [], sessionsThisWeek: 0, averageSessionTime: 0 },
  todayTasks: { tasks: [], completedToday: 0, totalTasks: 0, priorityQueue: [], upcomingDeadlines: [], interviewPrep: [], revisionQueue: [], overdue: [] },
  goals: [],
  streak: 0,
  heatmap: [],
  weeklyTrend: [],
  onboardingStatus: { completed: false, steps: {} },
  longestStreak: 0,
  monthlySolved: 0,
  pastInterviews: [],
  plannerTasks: [],
}

/**
 * Final safety net for dashboard endpoints. Even if an unexpected error escapes
 * the per-widget guards, we log the FULL stack trace and respond with a safe,
 * well-shaped 200 payload instead of an HTTP 500 — a partial/empty dashboard
 * is always preferable to a blank page.
 */
function safeDashboardHandler(handler, endpoint) {
  return async (req, res) => {
    const start = Date.now()
    try {
      const result = await handler(req, res)
      const duration = Date.now() - start
      logger.info(`[Dashboard] ${endpoint} completed`, { 
        userId: req.user?._id?.toString(), 
        durationMs: duration,
        status: 200 
      })
      return result
    } catch (error) {
      const duration = Date.now() - start
      logger.error('Dashboard endpoint failed — returning safe fallback', {
        endpoint,
        userId: req.user?._id?.toString(),
        error: error?.message,
        stack: error?.stack,
        durationMs: duration,
        context: 'dashboard',
      })
      res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved (partial)',
        data: emptyDashboardData(),
      })
    }
  }
}

function emptyDashboardData() {
  return {
    user: { name: '', email: '', onboarding: { completed: false, steps: {} } },
    readiness: DASHBOARD_DEFAULTS.readiness,
    applicationStats: DASHBOARD_DEFAULTS.applicationStats,
    companies: [],
    hotCompanies: [],
    interviews: [],
    notifications: [],
    todayFocus: [],
    dsaStats: { totalSolved: 0, weeklySolved: 0, weeklyDelta: 0, weakTopics: [] },
    streak: 0,
    codingStats: { currentStreak: 0, longestStreak: 0, weeklySolved: 0, monthlySolved: 0, totalSolved: 0 },
    heatmap: [],
    weeklyTrend: [],
    goals: [],
    recentActivity: [],
    stats: { applications: 0, interviews: 0, offers: 0, rejections: 0, problemsSolved: 0, goalsCompleted: 0, tasksCompleted: 0 },
  }
}

// GET /dashboard/overview - Unified endpoint for initial render
const overviewCache = new Map()
export const getDashboardOverview = safeDashboardHandler(async (req, res) => {
  const userId = req.user._id
  const cacheKey = `${userId}:overview`
  const cached = overviewCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < 5000) {
    logger.info('[Dashboard] overview cache hit', { userId: userId.toString() })
    return res.json(cached.payload)
  }
  
  logger.info('[Dashboard] overview request', { userId: userId.toString() })
  const widgetStart = Date.now()

  // Each widget is resolved independently. If one widget throws (e.g. a missing
  // index, a repository returning undefined), only that widget falls back to its
  // default — the rest of the dashboard still renders and the request stays 200.
  const widgets = await resolveWidgets(
    [
      ['user', userRepo.findById(userId)],
      ['readiness', analyticsService.getReadinessScore(userId)],
      ['applicationStats', analyticsService.getApplicationStats(userId)],
      ['companies', companyRepo.findAll(userId)],
      ['interviews', interviewRepo.getUpcomingInterviews(userId, 10)],
      ['notifications', notificationRepo.findUnread(userId)],
      ['dsaStats', dsaService.getStats(userId)],
      ['todayTasks', plannerService.getTodayFocus(userId)],
      ['goals', goalRepo.findActive(userId)],
      ['streak', analyticsService.getStreak(userId)],
      ['heatmap', analyticsService.getHeatmapData(userId, 84)],
      ['weeklyTrend', analyticsService.getWeeklyTrend(userId, 4)],
      ['onboardingStatus', userRepo.getOnboardingStatus(userId)],
      ['longestStreak', analyticsService.getLongestStreak(userId)],
      ['monthlySolved', analyticsService.getMonthlySolved(userId)],
    ],
    DASHBOARD_DEFAULTS,
    'dashboard:overview',
  )
  const widgetDuration = Date.now() - widgetStart
  logger.info(`[Dashboard] overview widgets resolved in ${widgetDuration}ms`, { userId: userId.toString() })

  const {
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
    onboardingStatus,
    longestStreak,
    monthlySolved,
  } = widgets

  const companiesList = safeArray(companies?.companies || companies)
  const activeCompanies = companiesList.filter((c) => c && c.status !== 'closed')
  const hotCompanies = activeCompanies.filter((c) => c && (c.status === 'hot' || c.status === 'offer'))
  const upcomingInterviews = safeArray(interviews).filter((i) => i && i.status === 'upcoming')

  const userName = user?.name || req.user?.name || 'there'
  const userEmail = user?.email || req.user?.email || ''

  const payloadStart = Date.now()
  const todayFocus = generateTodayFocus({
    hasCompanies: activeCompanies.length > 0,
    hasDsa: safeNumber(dsaStats?.totalSolved) > 0,
    hasGoals: safeArray(goals).length > 0,
    hasPlanner: safeArray(todayTasks?.tasks).length > 0,
    readiness: safeObject(readiness),
    hotCompanies,
    upcomingInterviews,
    weakTopics: safeArray(dsaStats?.weakTopics),
  })

  const recentActivity = await generateRecentActivity(
    userId,
    companiesList,
    safeArray(interviews),
    safeArray(goals),
    safeArray(todayTasks?.tasks),
    safeArray(notifications)
  )

  const codingStats = {
    currentStreak: safeNumber(streak),
    longestStreak: safeNumber(longestStreak),
    weeklySolved: safeNumber(dsaStats?.weeklySolved),
    monthlySolved: safeNumber(monthlySolved),
    totalSolved: safeNumber(dsaStats?.totalSolved),
  }

  const payload = {
    success: true,
    message: 'Dashboard overview retrieved',
    data: {
      user: {
        name: userName,
        email: userEmail,
        onboarding: safeObject(onboardingStatus),
      },
      readiness: safeObject(readiness),
      applicationStats: safeObject(applicationStats),
      companies: activeCompanies,
      hotCompanies,
      interviews: upcomingInterviews,
      notifications: safeArray(notifications),
      todayFocus,
      dsaStats: {
        totalSolved: safeNumber(dsaStats?.totalSolved),
        weeklySolved: safeNumber(dsaStats?.weeklySolved),
        weeklyDelta: safeNumber(dsaStats?.weeklyDelta),
        weakTopics: safeArray(dsaStats?.weakTopics),
      },
      streak: safeNumber(streak),
      codingStats,
      heatmap: safeArray(heatmap),
      weeklyTrend: safeArray(weeklyTrend),
      goals: safeArray(goals).slice(0, 5),
      recentActivity,
      stats: {
        applications: safeNumber(applicationStats?.total),
        interviews: upcomingInterviews.length,
        offers: safeNumber(applicationStats?.offers),
        rejections: safeNumber(applicationStats?.rejected),
        problemsSolved: safeNumber(dsaStats?.totalSolved),
        goalsCompleted: safeArray(goals).filter((g) => safeNumber(g?.progress) === 100).length,
        tasksCompleted: safeArray(todayTasks?.tasks).filter((t) => t?.done).length,
      },
    },
  }
  const payloadDuration = Date.now() - payloadStart
  logger.info(`[Dashboard] overview payload built in ${payloadDuration}ms`, { userId: userId.toString() })

  overviewCache.set(cacheKey, { ts: Date.now(), payload })
  logger.info('[Dashboard] overview response', { 
    userId: userId.toString(), 
    status: 200,
    hasData: !!payload.data 
  })
  res.json(payload)
})

// GET /dashboard/activity - Recent activity feed
export const getDashboardActivity = safeDashboardHandler(async (req, res) => {
  const userId = req.user._id
  const limit = parseInt(req.query.limit) || 20
  const start = Date.now()
  
  logger.info('[Dashboard] activity request', { userId: userId.toString(), limit })

  const widgets = await resolveWidgets(
    [
      ['companies', companyRepo.findRecent(userId, limit)],
      ['pastInterviews', interviewRepo.getPastInterviews(userId, limit)],
      ['goals', goalRepo.findRecent(userId, limit)],
      ['plannerTasks', plannerService.findRecent(userId, limit)],
      ['notifications', notificationRepo.findRecent(userId, limit)],
    ],
    DASHBOARD_DEFAULTS,
    'dashboard:activity',
  )

  const activity = await generateRecentActivity(
    userId,
    safeArray(widgets.companies),
    safeArray(widgets.pastInterviews),
    safeArray(widgets.goals),
    safeArray(widgets.plannerTasks),
    safeArray(widgets.notifications),
    limit
  )

  const duration = Date.now() - start
  logger.info('[Dashboard] activity response', { 
    userId: userId.toString(), 
    status: 200,
    activityCount: activity.length,
    durationMs: duration
  })
  res.json({
    success: true,
    message: 'Activity feed retrieved',
    data: { activity },
  })
})

// GET /dashboard/readiness - Detailed readiness breakdown
export const getDashboardReadiness = safeDashboardHandler(async (req, res) => {
  const userId = req.user._id
  const start = Date.now()
  
  logger.info('[Dashboard] readiness request', { userId: userId.toString() })

  const widgets = await resolveWidgets(
    [
      ['readiness', analyticsService.getReadinessScore(userId)],
      ['breakdown', analyticsService.getReadinessBreakdown(userId)],
    ],
    DASHBOARD_DEFAULTS,
    'dashboard:readiness',
  )

  const duration = Date.now() - start
  logger.info('[Dashboard] readiness response', { 
    userId: userId.toString(), 
    status: 200,
    hasReadiness: !!widgets.readiness,
    hasBreakdown: !!widgets.breakdown,
    durationMs: duration
  })
  res.json({
    success: true,
    message: 'Readiness data retrieved',
    data: { readiness: safeObject(widgets.readiness), breakdown: safeObject(widgets.breakdown) },
  })
})

// GET /dashboard/focus - Today's focus recommendations
export const getDashboardFocus = safeDashboardHandler(async (req, res) => {
  const userId = req.user._id
  const start = Date.now()
  
  logger.info('[Dashboard] focus request', { userId: userId.toString() })

  const widgets = await resolveWidgets(
    [
      ['companies', companyRepo.findAll(userId)],
      ['dsaStats', dsaService.getStats(userId)],
      ['goals', goalRepo.findActive(userId)],
      ['todayTasks', plannerService.getTodayFocus(userId)],
      ['upcomingInterviews', interviewRepo.getUpcomingInterviews(userId, 10)],
      ['weakTopics', dsaService.getWeakTopics(userId, 3)],
      ['readiness', analyticsService.getReadinessScore(userId)],
    ],
    DASHBOARD_DEFAULTS,
    'dashboard:focus',
  )

  const companiesList = safeArray(widgets.companies?.companies || widgets.companies)
  const activeCompanies = companiesList.filter((c) => c && c.status !== 'closed')

  const todayFocus = generateTodayFocus({
    hasCompanies: activeCompanies.length > 0,
    hasDsa: safeNumber(widgets.dsaStats?.totalSolved) > 0,
    hasGoals: safeArray(widgets.goals).length > 0,
    hasPlanner: safeArray(widgets.todayTasks?.tasks).length > 0,
    readiness: safeObject(widgets.readiness),
    hotCompanies: activeCompanies.filter((c) => c && (c.status === 'hot' || c.status === 'offer')),
    upcomingInterviews: safeArray(widgets.upcomingInterviews),
    weakTopics: safeArray(widgets.weakTopics),
  })

  const duration = Date.now() - start
  logger.info('[Dashboard] focus response', { 
    userId: userId.toString(), 
    status: 200,
    focusCount: todayFocus.length,
    durationMs: duration
  })
  res.json({
    success: true,
    message: 'Today\'s focus retrieved',
    data: { focus: todayFocus },
  })
})

// GET /dashboard/quick-actions - Available quick actions based on user state
export const getDashboardQuickActions = safeDashboardHandler(async (req, res) => {
  const userId = req.user._id
  const start = Date.now()
  
  logger.info('[Dashboard] quick-actions request', { userId: userId.toString() })

  const widgets = await resolveWidgets(
    [
      ['companies', companyRepo.findAll(userId)],
      ['hasProfile', userRepo.hasCompleteProfile(userId)],
    ],
    DASHBOARD_DEFAULTS,
    'dashboard:quick-actions',
  )

  const companiesList = safeArray(widgets.companies?.companies || widgets.companies)
  const activeCompanies = companiesList.filter((c) => c && c.status !== 'closed')
  const hasProfile = widgets.hasProfile === true
  const actions = [
    { id: 'add-application', label: 'Add Application', icon: '📋', available: true, route: '/app/applications' },
    { id: 'log-dsa', label: 'Log DSA Problem', icon: '🧮', available: true, route: '/app/dsa' },
    { id: 'add-planner-task', label: 'Add Planner Task', icon: '📅', available: true, route: '/app/planner' },
    { id: 'create-goal', label: 'Create Goal', icon: '🎯', available: true, route: '/app/goals' },
    { id: 'schedule-interview', label: 'Schedule Interview', icon: '🎯', available: activeCompanies.length > 0, route: '/app/interviews' },
    { id: 'update-profile', label: 'Update Profile', icon: '👤', available: !hasProfile, route: '/app/profile' },
  ].filter((a) => a.available)

  const duration = Date.now() - start
  logger.info('[Dashboard] quick-actions response', { 
    userId: userId.toString(), 
    status: 200,
    actionCount: actions.length,
    durationMs: duration
  })
  res.json({
    success: true,
    message: 'Quick actions retrieved',
    data: { actions },
  })
})

function generateTodayFocus(context) {
  const focus = []
  const { hasCompanies, hasDsa, hasGoals, hasPlanner, readiness, hotCompanies, upcomingInterviews, weakTopics } = context
  const safeReadiness = safeObject(readiness)

  if (safeReadiness.overall < 30) {
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
      title: `Prepare for ${nextInterview?.company || 'interview'} interview`,
      description: `${nextInterview?.round || 'Round'} scheduled - review key concepts`,
      priority: 'high',
      action: 'prepare-interview',
    })
  }

  if (weakTopics.length > 0) {
    const topWeak = weakTopics[0]
    focus.push({
      id: 'weak-topic',
      title: `Practice ${topWeak?.topic || 'weak topics'} problems`,
      description: `Your mastery is at ${safeNumber(topWeak?.mastery)}% - improve with practice`,
      priority: 'medium',
      action: 'practice-topic',
    })
  }

  if (safeReadiness.coding < 50 && hasDsa) {
    focus.push({
      id: 'coding-practice',
      title: 'Solve 2-3 coding problems today',
      description: 'Boost your coding readiness with consistent practice',
      priority: 'medium',
      action: 'log-dsa',
    })
  }

  if (safeReadiness.goalReadiness < 50 && hasGoals) {
    focus.push({
      id: 'goal-progress',
      title: 'Update your goal progress',
      description: 'Track your advancement towards placement targets',
      priority: 'medium',
      action: 'update-goals',
    })
  }

  return focus.slice(0, 4)
}

async function generateRecentActivity(userId, companies, interviews, goals, plannerTasks, notifications, limit = 10) {
  const activities = []

  safeArray(companies).slice(0, 5).forEach((company) => {
    if (!company) return
    activities.push({
      id: `company-${company._id || 'unknown'}`,
      type: 'application',
      title: `Added ${company.name || 'company'} application`,
      description: `${company.role || ''} ${company.stage || ''}`.trim() || 'Application added',
      timestamp: company.createdAt || new Date(),
      icon: '📋',
    })
  })

  safeArray(interviews).slice(0, 5).forEach((interview) => {
    if (!interview) return
    activities.push({
      id: `interview-${interview._id || 'unknown'}`,
      type: 'interview',
      title: `Interview scheduled with ${interview.company || 'company'}`,
      description: `${interview.round || ''} ${interview.when || ''}`.trim() || 'Interview scheduled',
      timestamp: interview.createdAt || new Date(),
      icon: '🎯',
    })
  })

  safeArray(goals).slice(0, 5).forEach((goal) => {
    if (!goal) return
    activities.push({
      id: `goal-${goal._id || 'unknown'}`,
      type: 'goal',
      title: safeNumber(goal.progress) === 100 ? 'Goal completed' : 'Goal created',
      description: goal.title || 'Goal',
      timestamp: goal.createdAt || new Date(),
      icon: '🎯',
    })
  })

  safeArray(plannerTasks).slice(0, 5).forEach((task) => {
    if (!task) return
    activities.push({
      id: `task-${task._id || 'unknown'}`,
      type: 'planner',
      title: task.done ? 'Completed planner task' : 'Added planner task',
      description: task.title || 'Task',
      timestamp: task.createdAt || new Date(),
      icon: '📅',
    })
  })

  safeArray(notifications).slice(0, 5).forEach((notification) => {
    if (!notification) return
    activities.push({
      id: `notification-${notification._id || 'unknown'}`,
      type: 'notification',
      title: notification.title || 'Notification',
      description: notification.message || '',
      timestamp: notification.createdAt || new Date(),
      icon: '🔔',
    })
  })

  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return activities.slice(0, limit).map((activity) => ({
    ...activity,
    timestamp: formatActivityTime(activity.timestamp),
  }))
}

function formatActivityTime(timestamp) {
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return 'Unknown time'
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
  } catch {
    return 'Unknown time'
  }
}