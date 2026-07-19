import { Router } from 'express'
import {
  getOverview,
  getReadiness,
  getReadinessBreakdown,
  getApplicationStats,
  getNewApplicationStats,
  getApplicationTrends,
  getApplicationFunnel,
  getApplicationSources,
  getAverageResponseTime,
  getStageDistribution,
  getTopRecruiters,
  getOfferConversion,
  getCompanyAnalytics,
  getIndustryDistribution,
  getLocationDistribution,
  getHiringTrends,
  getTopCompanies,
  getEligibilityAnalysis,
  getInterviewStats,
  getInterviewTrends,
  getInterviewTypeDistribution,
  getInterviewDifficultyTrends,
  getInterviewAverageRating,
  getUpcomingSchedule,
  getCancelledInterviews,
  getDsaOverview,
  getDsaDifficultyBreakdown,
  getDsaTopicMastery,
  getPlannerOverview,
  getInsights,
  getRecommendations,
  getWeeklyReport,
  getMonthlyReport,
  getPlacementReport,
  getWeeklyTrend,
  getHeatmap,
  getStreak,
} from '../controllers/analytics.controller.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()

router.use(authenticate)

// Overview
router.get('/overview', getOverview)

// Readiness
router.get('/readiness', getReadiness)
router.get('/readiness/breakdown', getReadinessBreakdown)

// Applications
router.get('/applications', getApplicationStats)
router.get('/applications/new', getNewApplicationStats)
router.get('/applications/trends', getApplicationTrends)
router.get('/applications/funnel', getApplicationFunnel)
router.get('/applications/sources', getApplicationSources)
router.get('/applications/response-time', getAverageResponseTime)
router.get('/applications/stages', getStageDistribution)
router.get('/applications/recruiters', getTopRecruiters)
router.get('/applications/conversion', getOfferConversion)

// Companies
router.get('/companies', getCompanyAnalytics)
router.get('/companies/industry', getIndustryDistribution)
router.get('/companies/location', getLocationDistribution)
router.get('/companies/hiring-trends', getHiringTrends)
router.get('/companies/top', getTopCompanies)
router.get('/companies/eligibility', getEligibilityAnalysis)

// Interviews
router.get('/interviews', getInterviewStats)
router.get('/interviews/trends', getInterviewTrends)
router.get('/interviews/types', getInterviewTypeDistribution)
router.get('/interviews/difficulty', getInterviewDifficultyTrends)
router.get('/interviews/rating', getInterviewAverageRating)
router.get('/interviews/schedule', getUpcomingSchedule)
router.get('/interviews/cancelled', getCancelledInterviews)

// DSA
router.get('/dsa', getDsaOverview)
router.get('/dsa/difficulty', getDsaDifficultyBreakdown)
router.get('/dsa/mastery', getDsaTopicMastery)

// Planner
router.get('/planner', getPlannerOverview)

// Cross-Module
router.get('/insights', getInsights)
router.get('/recommendations', getRecommendations)

// Reports
router.get('/reports/weekly', getWeeklyReport)
router.get('/reports/monthly', getMonthlyReport)
router.get('/reports/placement', getPlacementReport)

// Shared utilities
router.get('/trend', getWeeklyTrend)
router.get('/heatmap', getHeatmap)
router.get('/streak', getStreak)

export { router as analyticsRouter }
