/**
 * API service layer for PlacementPilot frontend.
 * Centralized axios instance with interceptors, token management, and error handling.
 */
import axios from 'axios'
import { toast } from 'sonner'

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 15000,
  withCredentials: true,
})

let refreshPromise = null

async function refreshTokens() {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshClient = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api/v1',
      withCredentials: true,
    })

    try {
      const refreshResponse = await refreshClient.post('/auth/refresh')
      const { accessToken } = refreshResponse.data.data

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken)
        return accessToken
      }
    } catch (refreshError) {
      localStorage.removeItem('accessToken')
      throw refreshError
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

function isAuthError(error) {
  const status = error.response?.status
  const code = error.response?.data?.code
  return status === 401 || code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN'
}

function isRefreshUnavailable(error) {
  const status = error.response?.status
  const code = error.response?.data?.code
  return status === 401 && (code === 'REFRESH_TOKEN_INVALID' || code === 'REFRESH_TOKEN_EXPIRED' || code === 'REFRESH_TOKEN_ROTATED')
}

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (isAuthError(error) && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const accessToken = await refreshTokens()

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        if (isRefreshUnavailable(refreshError)) {
          localStorage.removeItem('accessToken')
        }
        return Promise.reject(refreshError)
      }
    }

    const status = error.response?.status

    if (status === 403) {
      toast.error('Access denied.')
    } else if (status === 404) {
      toast.error('Resource not found.')
    } else if (status === 429) {
      toast.error('Too many requests. Please try again later.')
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    }

    return Promise.reject(error)
  }
)

// API methods
export const api = {
  // Auth
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  refresh: (data) => apiClient.post('/auth/refresh', data),
  forgotPassword: (data) => apiClient.post('/auth/forgot', data),
  resetPassword: (data) => apiClient.post('/auth/reset', data),

  // Dashboard
  getDashboard: () => apiClient.get('/dashboard'),
  getDashboardOverview: () => apiClient.get('/dashboard/overview'),
  getDashboardActivity: (limit) => apiClient.get(`/dashboard/activity?limit=${limit || 20}`),
  getDashboardReadiness: () => apiClient.get('/dashboard/readiness'),
  getDashboardFocus: () => apiClient.get('/dashboard/focus'),
  getDashboardQuickActions: () => apiClient.get('/dashboard/quick-actions'),

  // Users
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  updateNotificationPreferences: (data) => apiClient.put('/users/notifications', data),
  updateTheme: (data) => apiClient.put('/users/theme', data),
  updateOnboarding: (data) => apiClient.put('/users/onboarding', data),

  // Profile
  getProfileSummary: () => apiClient.get('/profile/summary'),
  getActivityTimeline: (limit = 50) => apiClient.get(`/profile/activity?limit=${limit}`),
  checkAchievements: () => apiClient.post('/profile/achievements/check'),
  getProfileAchievements: () => apiClient.get('/profile/achievements'),
  getDocuments: () => apiClient.get('/profile/documents'),
  createDocument: (data) => apiClient.post('/profile/documents', data),
  updateDocument: (id, data) => apiClient.put(`/profile/documents/${id}`, data),
  deleteDocument: (id) => apiClient.delete(`/profile/documents/${id}`),
  archiveDocument: (id, archived = true) => apiClient.patch(`/profile/documents/${id}/archive`, { archived }),
  getSkills: (category) => apiClient.get(category ? `/profile/skills?category=${encodeURIComponent(category)}` : '/profile/skills'),
  createSkill: (data) => apiClient.post('/profile/skills', data),
  updateSkill: (id, data) => apiClient.put(`/profile/skills/${id}`, data),
  deleteSkill: (id) => apiClient.delete(`/profile/skills/${id}`),

  // Companies
  getCompanies: (params) => apiClient.get('/companies', { params }),
  getCompany: (id) => apiClient.get(`/companies/${id}`),
  createCompany: (data) => apiClient.post('/companies', data),
  updateCompany: (id, data) => apiClient.put(`/companies/${id}`, data),
  deleteCompany: (id) => apiClient.delete(`/companies/${id}`),
  archiveCompany: (id, archived = true) => apiClient.patch(`/companies/${id}/archive`, { archived }),
  restoreCompany: (id) => apiClient.patch(`/companies/${id}/restore`),
  toggleFavorite: (id) => apiClient.patch(`/companies/${id}/favorite`),
  addCompanyNote: (id, data) => apiClient.post(`/companies/${id}/notes`, data),
  addCompanyAttachment: (id, data) => apiClient.post(`/companies/${id}/attachments`, data),
  removeCompanyAttachment: (id, url) => apiClient.delete(`/companies/${id}/attachments`, { data: { url } }),
  addCompanyTimeline: (id, data) => apiClient.post(`/companies/${id}/timeline`, data),
  getCompanyStats: () => apiClient.get('/companies/stats'),
  updateCompanyStats: (id) => apiClient.post(`/companies/${id}/stats/update`),
  getFavoriteCompanies: () => apiClient.get('/companies/favorites'),
  getRecentCompanies: (limit) => apiClient.get(`/companies/recent?limit=${limit || 10}`),
  getUpcomingFollowUps: (limit) => apiClient.get(`/companies/follow-ups/upcoming?limit=${limit || 10}`),

  // Recruiters
  createRecruiter: (companyId, data) => apiClient.post(`/companies/${companyId}/recruiters`, data),
  getRecruiters: (companyId) => apiClient.get(`/companies/${companyId}/recruiters`),
  updateRecruiter: (companyId, recruiterId, data) => apiClient.put(`/companies/${companyId}/recruiters/${recruiterId}`, data),
  deleteRecruiter: (companyId, recruiterId) => apiClient.delete(`/companies/${companyId}/recruiters/${recruiterId}`),

  // Resources
  createResource: (companyId, data) => apiClient.post(`/companies/${companyId}/resources`, data),
  getResources: (companyId, params) => apiClient.get(`/companies/${companyId}/resources`, { params }),
  updateResource: (companyId, resourceId, data) => apiClient.put(`/companies/${companyId}/resources/${resourceId}`, data),
  deleteResource: (companyId, resourceId) => apiClient.delete(`/companies/${companyId}/resources/${resourceId}`),

  // Hiring Info
  createHiringInfo: (companyId, data) => apiClient.post(`/companies/${companyId}/hiring-info`, data),
  getHiringInfo: (companyId) => apiClient.get(`/companies/${companyId}/hiring-info`),
  updateHiringInfo: (companyId, data) => apiClient.put(`/companies/${companyId}/hiring-info`, data),
  deleteHiringInfo: (companyId) => apiClient.delete(`/companies/${companyId}/hiring-info`),

  // Applications
  getApplications: (params) => apiClient.get('/applications', { params }),
  getApplication: (id) => apiClient.get(`/applications/${id}`),
  createApplication: (data) => apiClient.post('/applications', data),
  updateApplication: (id, data) => apiClient.put(`/applications/${id}`, data),
  deleteApplication: (id) => apiClient.delete(`/applications/${id}`),
  archiveApplication: (id, archived = true) => apiClient.patch(`/applications/${id}/archive?archived=${archived}`),
  restoreApplication: (id) => apiClient.patch(`/applications/${id}/restore`),
  duplicateApplication: (id) => apiClient.post(`/applications/${id}/duplicate`),
  bulkActionApplications: (data) => apiClient.post('/applications/bulk', data),
  addApplicationNote: (id, data) => apiClient.post(`/applications/${id}/notes`, data),
  addApplicationAttachment: (id, data) => apiClient.post(`/applications/${id}/attachments`, data),
  removeApplicationAttachment: (id, url) => apiClient.delete(`/applications/${id}/attachments`, { data: { url } }),
  getApplicationDashboardStats: () => apiClient.get('/applications/stats/dashboard'),
  getApplicationCounts: () => apiClient.get('/applications/stats/counts'),
  getUpcomingDeadlines: (limit) => apiClient.get(`/applications/deadlines/upcoming?limit=${limit || 10}`),
  getRecentApplications: (limit) => apiClient.get(`/applications/recent?limit=${limit || 10}`),

  // Interviews
  getInterviews: (params) => apiClient.get('/interviews', { params }),
  getInterview: (id) => apiClient.get(`/interviews/${id}`),
  createInterview: (data) => apiClient.post('/interviews', data),
  updateInterview: (id, data) => apiClient.put(`/interviews/${id}`, data),
  deleteInterview: (id) => apiClient.delete(`/interviews/${id}`),
  archiveInterview: (id, archived = true) => apiClient.patch(`/interviews/${id}/archive?archived=${archived}`),
  restoreInterview: (id) => apiClient.patch(`/interviews/${id}/restore`),
  duplicateInterview: (id) => apiClient.post(`/interviews/${id}/duplicate`),
  rescheduleInterview: (id, data) => apiClient.post(`/interviews/${id}/reschedule`, data),
  cancelInterview: (id, data) => apiClient.post(`/interviews/${id}/cancel`, data),
  completeInterview: (id) => apiClient.post(`/interviews/${id}/complete`),
  submitInterviewFeedback: (id, data) => apiClient.post(`/interviews/${id}/feedback`, data),
  addInterviewNote: (id, data) => apiClient.post(`/interviews/${id}/notes`, data),
  addInterviewAttachment: (id, data) => apiClient.post(`/interviews/${id}/attachments`, data),
  removeInterviewAttachment: (id, url) => apiClient.delete(`/interviews/${id}/attachments`, { data: { url } }),
  bulkActionInterviews: (data) => apiClient.post('/interviews/bulk', data),
  getUpcomingInterviews: (limit) => apiClient.get(`/interviews/upcoming?limit=${limit || 10}`),
  getPastInterviews: (limit) => apiClient.get(`/interviews/past?limit=${limit || 10}`),
  getTodayInterviews: () => apiClient.get('/interviews/today'),
  getCalendarInterviews: (startDate, endDate) => apiClient.get(`/interviews/calendar?startDate=${startDate}&endDate=${endDate}`),
  getPendingFeedbackInterviews: (limit) => apiClient.get(`/interviews/pending-feedback?limit=${limit || 20}`),
  getInterviewDashboardStats: () => apiClient.get('/interviews/stats/dashboard'),
  getInterviewCounts: () => apiClient.get('/interviews/stats/counts'),
  getInterviewAnalytics: () => apiClient.get('/interviews/analytics'),
  getCompanyInterviewStats: (companyId) => apiClient.get(`/interviews/company/${companyId}/stats`),
  getApplicationInterviewStats: (applicationId) => apiClient.get(`/interviews/application/${applicationId}/stats`),
  addChecklistItem: (id, data) => apiClient.post(`/interviews/${id}/preparation/checklist`, data),
  toggleChecklistItem: (id, data) => apiClient.patch(`/interviews/${id}/preparation/checklist/toggle`, data),
  removeChecklistItem: (id, itemId) => apiClient.delete(`/interviews/${id}/preparation/checklist/${itemId}`),
  updateInterviewPreparation: (id, data) => apiClient.put(`/interviews/${id}/preparation`, data),
  addInterviewer: (id, data) => apiClient.post(`/interviews/${id}/interviewers`, data),
  removeInterviewer: (id, interviewerId) => apiClient.delete(`/interviews/${id}/interviewers/${interviewerId}`),

  // DSA
  getDsaTopics: () => apiClient.get('/dsa/topics'),
  createDsaTopic: (data) => apiClient.post('/dsa/topics', data),
  updateDsaTopic: (id, data) => apiClient.put(`/dsa/topics/${id}`, data),
  deleteDsaTopic: (id) => apiClient.delete(`/dsa/topics/${id}`),
  logDsaProblem: (data) => apiClient.post('/dsa/problems', data),
  getDsaProblems: (params) => apiClient.get('/dsa/problems', { params }),
  getDsaProblem: (id) => apiClient.get(`/dsa/problems/${id}`),
  updateDsaProblem: (id, data) => apiClient.put(`/dsa/problems/${id}`, data),
  deleteDsaProblem: (id) => apiClient.delete(`/dsa/problems/${id}`),
  bulkUpdateDsaProblems: (data) => apiClient.post('/dsa/problems/bulk', data),
  toggleDsaFavorite: (id) => apiClient.patch(`/dsa/problems/${id}/favorite`),
  toggleDsaBookmark: (id) => apiClient.patch(`/dsa/problems/${id}/bookmark`),
  toggleDsaStar: (id) => apiClient.patch(`/dsa/problems/${id}/star`),
  getDsaBookmarks: (params) => apiClient.get('/dsa/problems/bookmarks', { params }),
  getDsaFavorites: (params) => apiClient.get('/dsa/problems/favorites', { params }),
  getDsaStats: () => apiClient.get('/dsa/stats'),
  getDsaDashboardStats: () => apiClient.get('/dsa/dashboard/stats'),
  getDsaRevisionQueue: () => apiClient.get('/dsa/dashboard/revision-queue'),
  getDsaInsights: () => apiClient.get('/dsa/insights'),
  getDsaHeatmap: (days) => apiClient.get(`/dsa/analytics/heatmap?days=${days || 84}`),
  getDsaStreak: () => apiClient.get('/dsa/analytics/streak'),
  getDsaWeakTopics: (limit) => apiClient.get(`/dsa/analytics/weak-topics?limit=${limit || 5}`),
  getDsaStrongTopics: (limit) => apiClient.get(`/dsa/analytics/strong-topics?limit=${limit || 5}`),
  getDsaCompanyReadiness: (companyName) => apiClient.get(`/dsa/analytics/company-readiness?companyName=${encodeURIComponent(companyName)}`),
  getDsaRecommendedProblems: (topics, limit) => apiClient.get(`/dsa/analytics/recommended?topics=${topics || ''}&limit=${limit || 10}`),
  getDsaTrends: (months) => apiClient.get(`/dsa/analytics/trends?months=${months || 6}`),

  // Sessions
  createDsaSession: (data) => apiClient.post('/dsa/sessions', data),
  getDsaSessions: (params) => apiClient.get('/dsa/sessions', { params }),
  getDsaSession: (id) => apiClient.get(`/dsa/sessions/${id}`),
  updateDsaSession: (id, data) => apiClient.put(`/dsa/sessions/${id}`, data),
  endDsaSession: (id) => apiClient.post(`/dsa/sessions/${id}/end`),
  deleteDsaSession: (id) => apiClient.delete(`/dsa/sessions/${id}`),

  // Roadmaps
  createDsaRoadmap: (data) => apiClient.post('/dsa/roadmaps', data),
  getDsaRoadmaps: () => apiClient.get('/dsa/roadmaps'),
  getDsaRoadmap: (id) => apiClient.get(`/dsa/roadmaps/${id}`),
  updateDsaRoadmap: (id, data) => apiClient.put(`/dsa/roadmaps/${id}`, data),
  deleteDsaRoadmap: (id) => apiClient.delete(`/dsa/roadmaps/${id}`),
  completeDsaRoadmapProblem: (id, problemId) => apiClient.post(`/dsa/roadmaps/${id}/complete-problem`, { problemId }),
  getDsaRoadmapProgress: (id) => apiClient.get(`/dsa/roadmaps/${id}/progress`),

  // Revisions
  createDsaRevision: (data) => apiClient.post('/dsa/revisions', data),
  getDsaRevisions: (params) => apiClient.get('/dsa/revisions', { params }),
  getDsaRevision: (id) => apiClient.get(`/dsa/revisions/${id}`),
  updateDsaRevision: (id, data) => apiClient.put(`/dsa/revisions/${id}`, data),
  completeDsaRevision: (id) => apiClient.post(`/dsa/revisions/${id}/complete`),
  skipDsaRevision: (id) => apiClient.post(`/dsa/revisions/${id}/skip`),
  deleteDsaRevision: (id) => apiClient.delete(`/dsa/revisions/${id}`),
  getDsaDailyRevisionQueue: () => apiClient.get('/dsa/revisions/daily'),
  getDsaWeeklyRevisionQueue: () => apiClient.get('/dsa/revisions/weekly'),
  getDsaMissedRevisions: () => apiClient.get('/dsa/revisions/missed'),

  // Goals
  getGoals: () => apiClient.get('/goals'),
  createGoal: (data) => apiClient.post('/goals', data),
  updateGoal: (id, data) => apiClient.put(`/goals/${id}`, data),
  deleteGoal: (id) => apiClient.delete(`/goals/${id}`),

  // Planner Tasks
  getPlannerTasks: (params) => apiClient.get('/planner/tasks', { params }),
  getPlannerTask: (id) => apiClient.get(`/planner/tasks/${id}`),
  createPlannerTask: (data) => apiClient.post('/planner/tasks', data),
  updatePlannerTask: (id, data) => apiClient.put(`/planner/tasks/${id}`, data),
  deletePlannerTask: (id) => apiClient.delete(`/planner/tasks/${id}`),
  markPlannerTaskComplete: (id) => apiClient.post(`/planner/tasks/${id}/complete`),
  bulkUpdatePlannerTasks: (data) => apiClient.post('/planner/tasks/bulk', data),

  // Calendar
  getPlannerCalendar: (startDate, endDate) => apiClient.get(`/planner/calendar?startDate=${startDate}&endDate=${endDate}`),
  checkPlannerConflict: (date, duration) => apiClient.get(`/planner/calendar/check-conflict?date=${date}&duration=${duration || 60}`),

  // Daily Planner
  getDailyPlanner: (date) => apiClient.get(`/planner/daily?date=${date || new Date().toISOString()}`),
  getTodayFocus: () => apiClient.get('/planner/today-focus'),

  // Smart Tasks
  generateSmartTasks: () => apiClient.post('/planner/smart-tasks/generate'),
  getSmartTasks: () => apiClient.get('/planner/smart-tasks'),
  syncAllModules: () => apiClient.post('/planner/sync-all'),

  // Habits
  getPlannerHabits: () => apiClient.get('/planner/habits'),
  getPlannerHabit: (id) => apiClient.get(`/planner/habits/${id}`),
  createPlannerHabit: (data) => apiClient.post('/planner/habits', data),
  updatePlannerHabit: (id, data) => apiClient.put(`/planner/habits/${id}`, data),
  deletePlannerHabit: (id) => apiClient.delete(`/planner/habits/${id}`),
  completePlannerHabit: (id, date, value) => apiClient.post(`/planner/habits/${id}/complete`, { date, value }),

  // Goals (planner-specific)
  getPlannerGoals: () => apiClient.get('/planner/goals'),
  getPlannerGoal: (id) => apiClient.get(`/planner/goals/${id}`),
  createPlannerGoal: (data) => apiClient.post('/planner/goals', data),
  updatePlannerGoal: (id, data) => apiClient.put(`/planner/goals/${id}`, data),
  deletePlannerGoal: (id) => apiClient.delete(`/planner/goals/${id}`),
  markPlannerGoalComplete: (id) => apiClient.post(`/planner/goals/${id}/complete`),

  // Analytics
  getPlannerAnalytics: () => apiClient.get('/planner/analytics'),
  getPlannerStats: () => apiClient.get('/planner/stats'),

  // Notifications
  getNotifications: () => apiClient.get('/notifications'),
  markAllNotificationsRead: () => apiClient.patch('/notifications/read-all'),
  markNotificationRead: (id) => apiClient.patch(`/notifications/${id}/read`),

  // Analytics
  getAnalyticsOverview: () => apiClient.get('/analytics/overview'),
  getReadiness: () => apiClient.get('/analytics/readiness'),
  getReadinessBreakdown: () => apiClient.get('/analytics/readiness/breakdown'),
  getApplicationStats: () => apiClient.get('/analytics/applications'),
  getNewApplicationStats: () => apiClient.get('/analytics/applications/new'),
  getApplicationTrends: (months = 6) => apiClient.get(`/analytics/applications/trends?months=${months}`),
  getApplicationFunnel: () => apiClient.get('/analytics/applications/funnel'),
  getApplicationSources: () => apiClient.get('/analytics/applications/sources'),
  getAverageResponseTime: () => apiClient.get('/analytics/applications/response-time'),
  getStageDistribution: () => apiClient.get('/analytics/applications/stages'),
  getTopRecruiters: () => apiClient.get('/analytics/applications/recruiters'),
  getOfferConversion: () => apiClient.get('/analytics/applications/conversion'),
  getCompanyAnalytics: () => apiClient.get('/analytics/companies'),
  getIndustryDistribution: () => apiClient.get('/analytics/companies/industry'),
  getLocationDistribution: () => apiClient.get('/analytics/companies/location'),
  getHiringTrends: (months = 6) => apiClient.get(`/analytics/companies/hiring-trends?months=${months}`),
  getTopCompanies: (limit = 10) => apiClient.get(`/analytics/companies/top?limit=${limit}`),
  getEligibilityAnalysis: () => apiClient.get('/analytics/companies/eligibility'),
  getInterviewStats: () => apiClient.get('/analytics/interviews'),
  getInterviewTrends: (months = 6) => apiClient.get(`/analytics/interviews/trends?months=${months}`),
  getInterviewTypeDistribution: () => apiClient.get('/analytics/interviews/types'),
  getInterviewDifficultyTrends: () => apiClient.get('/analytics/interviews/difficulty'),
  getInterviewAverageRating: () => apiClient.get('/analytics/interviews/rating'),
  getUpcomingSchedule: () => apiClient.get('/analytics/interviews/schedule'),
  getCancelledInterviews: () => apiClient.get('/analytics/interviews/cancelled'),
  getDsaOverview: () => apiClient.get('/analytics/dsa'),
  getDsaDifficultyBreakdown: () => apiClient.get('/analytics/dsa/difficulty'),
  getDsaTopicMastery: () => apiClient.get('/analytics/dsa/mastery'),
  getPlannerOverview: () => apiClient.get('/analytics/planner'),
  getPlannerAnalytics: () => apiClient.get('/planner/analytics'),
  getInsights: () => apiClient.get('/analytics/insights'),
  getRecommendations: () => apiClient.get('/analytics/recommendations'),
  getWeeklyReport: () => apiClient.get('/analytics/reports/weekly'),
  getMonthlyReport: () => apiClient.get('/analytics/reports/monthly'),
  getPlacementReport: () => apiClient.get('/analytics/reports/placement'),
  getWeeklyTrend: (weeks = 12) => apiClient.get(`/analytics/trend?weeks=${weeks}`),
  getHeatmap: (days = 84) => apiClient.get(`/analytics/heatmap?days=${days}`),
  getStreak: () => apiClient.get('/analytics/streak'),

  // Achievements
  getAchievements: () => apiClient.get('/achievements'),

  // Settings
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (data) => apiClient.put('/settings', data),
  changePassword: (data) => apiClient.post('/settings/change-password', data),
  getSessions: () => apiClient.get('/settings/sessions'),
  revokeSessions: () => apiClient.post('/settings/sessions/revoke'),
  deleteAccount: () => apiClient.delete('/settings/account'),
  updateAppearance: (data) => apiClient.put('/settings/appearance', data),
  updateNotifications: (data) => apiClient.put('/settings/notifications', data),
  updatePrivacy: (data) => apiClient.put('/settings/privacy', data),
  updateSecurity: (data) => apiClient.put('/settings/security', data),
  getLoginHistory: () => apiClient.get('/settings/security/login-history'),
  getSecurityLog: () => apiClient.get('/settings/security/log'),
  updateProductivity: (data) => apiClient.put('/settings/productivity', data),
  getIntegrations: () => apiClient.get('/settings/integrations'),
  updateIntegration: (key, data) => apiClient.put(`/settings/integrations/${key}`, data),
  disconnectIntegration: (key) => apiClient.delete(`/settings/integrations/${key}`),
  exportData: () => apiClient.post('/settings/export'),
  clearCache: () => apiClient.post('/settings/clear-cache'),
  resetPreferences: () => apiClient.post('/settings/reset'),
  deleteArchivedData: () => apiClient.post('/settings/delete-archived'),

  // Waitlist
  joinWaitlist: (data) => apiClient.post('/waitlist', data),
  getWaitlistStats: () => apiClient.get('/waitlist/stats'),
}

export default apiClient