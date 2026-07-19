import { AnalyticsService } from '../services/analytics.service.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'

const analyticsService = new AnalyticsService()

export const getOverview = asyncWrapper(async (req, res) => {
  const overview = await analyticsService.getOverview(req.user._id)
  res.json({
    success: true,
    message: 'Analytics overview retrieved',
    data: overview,
  })
})

export const getReadiness = asyncWrapper(async (req, res) => {
  const readiness = await analyticsService.getReadinessScore(req.user._id)
  res.json({
    success: true,
    message: 'Readiness score retrieved',
    data: { readiness },
  })
})

export const getReadinessBreakdown = asyncWrapper(async (req, res) => {
  const breakdown = await analyticsService.getReadinessBreakdown(req.user._id)
  res.json({
    success: true,
    message: 'Readiness breakdown retrieved',
    data: { breakdown },
  })
})

export const getApplicationStats = asyncWrapper(async (req, res) => {
  const stats = await analyticsService.getApplicationStats(req.user._id)
  res.json({
    success: true,
    message: 'Application stats retrieved',
    data: { stats },
  })
})

export const getNewApplicationStats = asyncWrapper(async (req, res) => {
  const stats = await analyticsService.getNewApplicationStats(req.user._id)
  res.json({
    success: true,
    message: 'Application stats retrieved',
    data: { stats },
  })
})

export const getApplicationTrends = asyncWrapper(async (req, res) => {
  const months = parseInt(req.query.months) || 6
  const trends = await analyticsService.getApplicationTrends(req.user._id, months)
  res.json({
    success: true,
    message: 'Application trends retrieved',
    data: { trends },
  })
})

export const getApplicationFunnel = asyncWrapper(async (req, res) => {
  const funnel = await analyticsService.getApplicationFunnel(req.user._id)
  res.json({
    success: true,
    message: 'Application funnel retrieved',
    data: { funnel },
  })
})

export const getApplicationSources = asyncWrapper(async (req, res) => {
  const sources = await analyticsService.getApplicationSources(req.user._id)
  res.json({
    success: true,
    message: 'Application sources retrieved',
    data: { sources },
  })
})

export const getAverageResponseTime = asyncWrapper(async (req, res) => {
  const response = await analyticsService.getAverageResponseTime(req.user._id)
  res.json({
    success: true,
    message: 'Average response time retrieved',
    data: response,
  })
})

export const getStageDistribution = asyncWrapper(async (req, res) => {
  const distribution = await analyticsService.getStageDistribution(req.user._id)
  res.json({
    success: true,
    message: 'Stage distribution retrieved',
    data: { distribution },
  })
})

export const getTopRecruiters = asyncWrapper(async (req, res) => {
  const recruiters = await analyticsService.getTopRecruiters(req.user._id)
  res.json({
    success: true,
    message: 'Top recruiters retrieved',
    data: { recruiters },
  })
})

export const getOfferConversion = asyncWrapper(async (req, res) => {
  const conversion = await analyticsService.getOfferConversion(req.user._id)
  res.json({
    success: true,
    message: 'Offer conversion retrieved',
    data: conversion,
  })
})

// ── Company Analytics ──────────────────────────────────────────────────────

export const getCompanyAnalytics = asyncWrapper(async (req, res) => {
  const analytics = await analyticsService.getCompanyAnalytics(req.user._id)
  res.json({
    success: true,
    message: 'Company analytics retrieved',
    data: { analytics },
  })
})

export const getIndustryDistribution = asyncWrapper(async (req, res) => {
  const distribution = await analyticsService.getIndustryDistribution(req.user._id)
  res.json({
    success: true,
    message: 'Industry distribution retrieved',
    data: { distribution },
  })
})

export const getLocationDistribution = asyncWrapper(async (req, res) => {
  const distribution = await analyticsService.getLocationDistribution(req.user._id)
  res.json({
    success: true,
    message: 'Location distribution retrieved',
    data: { distribution },
  })
})

export const getHiringTrends = asyncWrapper(async (req, res) => {
  const months = parseInt(req.query.months) || 6
  const trends = await analyticsService.getHiringTrends(req.user._id, months)
  res.json({
    success: true,
    message: 'Hiring trends retrieved',
    data: { trends },
  })
})

export const getTopCompanies = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10
  const companies = await analyticsService.getTopCompanies(req.user._id, limit)
  res.json({
    success: true,
    message: 'Top companies retrieved',
    data: { companies },
  })
})

export const getEligibilityAnalysis = asyncWrapper(async (req, res) => {
  const analysis = await analyticsService.getEligibilityAnalysis(req.user._id)
  res.json({
    success: true,
    message: 'Eligibility analysis retrieved',
    data: { analysis },
  })
})

// ── Interview Analytics ────────────────────────────────────────────────────

export const getInterviewStats = asyncWrapper(async (req, res) => {
  const stats = await analyticsService.getInterviewStats(req.user._id)
  res.json({
    success: true,
    message: 'Interview stats retrieved',
    data: stats,
  })
})

export const getInterviewTrends = asyncWrapper(async (req, res) => {
  const months = parseInt(req.query.months) || 6
  const trends = await analyticsService.getInterviewTrends(req.user._id, months)
  res.json({
    success: true,
    message: 'Interview trends retrieved',
    data: { trends },
  })
})

export const getInterviewTypeDistribution = asyncWrapper(async (req, res) => {
  const distribution = await analyticsService.getInterviewTypeDistribution(req.user._id)
  res.json({
    success: true,
    message: 'Interview type distribution retrieved',
    data: { distribution },
  })
})

export const getInterviewDifficultyTrends = asyncWrapper(async (req, res) => {
  const trends = await analyticsService.getInterviewDifficultyTrends(req.user._id)
  res.json({
    success: true,
    message: 'Interview difficulty trends retrieved',
    data: { trends },
  })
})

export const getInterviewAverageRating = asyncWrapper(async (req, res) => {
  const rating = await analyticsService.getInterviewAverageRating(req.user._id)
  res.json({
    success: true,
    message: 'Interview average rating retrieved',
    data: rating,
  })
})

export const getUpcomingSchedule = asyncWrapper(async (req, res) => {
  const schedule = await analyticsService.getUpcomingSchedule(req.user._id)
  res.json({
    success: true,
    message: 'Upcoming schedule retrieved',
    data: { schedule },
  })
})

export const getCancelledInterviews = asyncWrapper(async (req, res) => {
  const interviews = await analyticsService.getCancelledInterviews(req.user._id)
  res.json({
    success: true,
    message: 'Cancelled interviews retrieved',
    data: { interviews },
  })
})

// ── DSA Analytics ──────────────────────────────────────────────────────────

export const getDsaOverview = asyncWrapper(async (req, res) => {
  const overview = await analyticsService.getDsaOverview(req.user._id)
  res.json({
    success: true,
    message: 'DSA overview retrieved',
    data: overview,
  })
})

export const getDsaDifficultyBreakdown = asyncWrapper(async (req, res) => {
  const breakdown = await analyticsService.getDsaDifficultyBreakdown(req.user._id)
  res.json({
    success: true,
    message: 'DSA difficulty breakdown retrieved',
    data: { breakdown },
  })
})

export const getDsaTopicMastery = asyncWrapper(async (req, res) => {
  const mastery = await analyticsService.getDsaTopicMastery(req.user._id)
  res.json({
    success: true,
    message: 'DSA topic mastery retrieved',
    data: { mastery },
  })
})

export const getDsaWeakTopics = asyncWrapper(async (req, res) => {
  const topics = await analyticsService.getWeakTopics(req.user._id)
  res.json({
    success: true,
    message: 'Weak topics retrieved',
    data: { topics },
  })
})

export const getDsaStrongTopics = asyncWrapper(async (req, res) => {
  const topics = await analyticsService.getStrongTopics(req.user._id)
  res.json({
    success: true,
    message: 'Strong topics retrieved',
    data: { topics },
  })
})

export const getDsaTrends = asyncWrapper(async (req, res) => {
  const months = parseInt(req.query.months) || 6
  const trends = await analyticsService.getDsaTrends(req.user._id, months)
  res.json({
    success: true,
    message: 'DSA trends retrieved',
    data: { trends },
  })
})

export const getDsaRoadmapProgress = asyncWrapper(async (req, res) => {
  const progress = await analyticsService.getDsaRoadmapProgress(req.user._id)
  res.json({
    success: true,
    message: 'DSA roadmap progress retrieved',
    data: { progress },
  })
})

export const getDsaCompanyReadiness = asyncWrapper(async (req, res) => {
  const companyName = req.query.companyName || ''
  const readiness = await analyticsService.getCompanyReadiness(req.user._id, companyName)
  res.json({
    success: true,
    message: 'Company readiness retrieved',
    data: readiness,
  })
})

export const getDsaRecommendedProblems = asyncWrapper(async (req, res) => {
  const topics = req.query.topics || ''
  const limit = parseInt(req.query.limit) || 10
  const problems = await analyticsService.getRecommendedProblems(req.user._id, topics, limit)
  res.json({
    success: true,
    message: 'Recommended problems retrieved',
    data: { problems },
  })
})

// ── Planner Analytics ──────────────────────────────────────────────────────

export const getPlannerAnalytics = asyncWrapper(async (req, res) => {
  const analytics = await analyticsService.getPlannerAnalytics(req.user._id)
  res.json({
    success: true,
    message: 'Planner analytics retrieved',
    data: analytics,
  })
})

export const getPlannerOverview = asyncWrapper(async (req, res) => {
  const overview = await analyticsService.getPlannerOverview(req.user._id)
  res.json({
    success: true,
    message: 'Planner overview retrieved',
    data: overview,
  })
})

// ── Cross-Module Insights ──────────────────────────────────────────────────

export const getInsights = asyncWrapper(async (req, res) => {
  const insights = await analyticsService.getInsights(req.user._id)
  res.json({
    success: true,
    message: 'Insights retrieved',
    data: { insights },
  })
})

export const getRecommendations = asyncWrapper(async (req, res) => {
  const recommendations = await analyticsService.getRecommendations(req.user._id)
  res.json({
    success: true,
    message: 'Recommendations retrieved',
    data: { recommendations },
  })
})

// ── Reports ────────────────────────────────────────────────────────────────

export const getWeeklyReport = asyncWrapper(async (req, res) => {
  const report = await analyticsService.getWeeklyReport(req.user._id)
  res.json({
    success: true,
    message: 'Weekly report retrieved',
    data: report,
  })
})

export const getMonthlyReport = asyncWrapper(async (req, res) => {
  const report = await analyticsService.getMonthlyReport(req.user._id)
  res.json({
    success: true,
    message: 'Monthly report retrieved',
    data: report,
  })
})

export const getPlacementReport = asyncWrapper(async (req, res) => {
  const report = await analyticsService.getPlacementReport(req.user._id)
  res.json({
    success: true,
    message: 'Placement report retrieved',
    data: report,
  })
})

// ── Shared Utilities ───────────────────────────────────────────────────────

export const getWeeklyTrend = asyncWrapper(async (req, res) => {
  const weeks = parseInt(req.query.weeks) || 12
  const trend = await analyticsService.getWeeklyTrend(req.user._id, weeks)
  res.json({
    success: true,
    message: 'Weekly trend retrieved',
    data: { trend },
  })
})

export const getHeatmap = asyncWrapper(async (req, res) => {
  const days = parseInt(req.query.days) || 84
  const heatmap = await analyticsService.getHeatmapData(req.user._id, days)
  res.json({
    success: true,
    message: 'Heatmap data retrieved',
    data: { heatmap },
  })
})

export const getStreak = asyncWrapper(async (req, res) => {
  const streak = await analyticsService.getStreak(req.user._id)
  res.json({
    success: true,
    message: 'Streak retrieved',
    data: { streak },
  })
})
