import { InterviewService } from '../services/interview.service.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'

const interviewService = new InterviewService()

export const createInterview = asyncWrapper(async (req, res) => {
  const interview = await interviewService.createInterview(req.user._id, req.body)
  res.status(201).json({
    success: true,
    message: 'Interview scheduled successfully',
    data: { interview },
  })
})

export const getInterview = asyncWrapper(async (req, res) => {
  const interview = await interviewService.getInterview(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Interview retrieved',
    data: { interview },
  })
})

export const getInterviews = asyncWrapper(async (req, res) => {
  const filters = {}
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    sortBy: req.query.sortBy || 'scheduledDate',
    sortOrder: req.query.sortOrder || 'asc',
    search: req.query.search || '',
    status: req.query.status,
    type: req.query.type,
    round: req.query.round,
    company: req.query.company,
    companyId: req.query.companyId,
    applicationId: req.query.applicationId,
    mode: req.query.mode,
    decision: req.query.decision,
    result: req.query.result,
    priority: req.query.priority,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    archived: req.query.archived === 'true',
  }

  const result = await interviewService.getInterviews(req.user._id, filters, options)
  res.json({
    success: true,
    message: 'Interviews retrieved',
    data: result,
  })
})

export const updateInterview = asyncWrapper(async (req, res) => {
  const interview = await interviewService.updateInterview(req.user._id, req.params.id, req.body)
  res.json({
    success: true,
    message: 'Interview updated successfully',
    data: { interview },
  })
})

export const deleteInterview = asyncWrapper(async (req, res) => {
  const result = await interviewService.deleteInterview(req.user._id, req.params.id)
  res.json({
    success: true,
    message: result.message,
    data: null,
  })
})

export const archiveInterview = asyncWrapper(async (req, res) => {
  const { archived } = req.query
  const result = await interviewService.archiveInterview(req.user._id, req.params.id, archived !== 'false')
  res.json({
    success: true,
    message: result.message,
    data: null,
  })
})

export const restoreInterview = asyncWrapper(async (req, res) => {
  const result = await interviewService.restoreInterview(req.user._id, req.params.id)
  res.json({
    success: true,
    message: result.message,
    data: null,
  })
})

export const duplicateInterview = asyncWrapper(async (req, res) => {
  const interview = await interviewService.duplicateInterview(req.user._id, req.params.id)
  res.status(201).json({
    success: true,
    message: 'Interview duplicated successfully',
    data: { interview },
  })
})

export const rescheduleInterview = asyncWrapper(async (req, res) => {
  const interview = await interviewService.rescheduleInterview(req.user._id, req.params.id, req.body)
  res.json({
    success: true,
    message: 'Interview rescheduled successfully',
    data: { interview },
  })
})

export const cancelInterview = asyncWrapper(async (req, res) => {
  const { reason } = req.body
  const interview = await interviewService.cancelInterview(req.user._id, req.params.id, reason)
  res.json({
    success: true,
    message: 'Interview cancelled successfully',
    data: { interview },
  })
})

export const completeInterview = asyncWrapper(async (req, res) => {
  const interview = await interviewService.completeInterview(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Interview marked as completed',
    data: { interview },
  })
})

export const submitFeedback = asyncWrapper(async (req, res) => {
  const interview = await interviewService.submitFeedback(req.user._id, req.params.id, req.body)
  res.json({
    success: true,
    message: 'Feedback submitted successfully',
    data: { interview },
  })
})

export const addNote = asyncWrapper(async (req, res) => {
  const { note } = req.body
  const interview = await interviewService.addNote(req.user._id, req.params.id, note)
  res.json({
    success: true,
    message: 'Note added successfully',
    data: { interview },
  })
})

export const addAttachment = asyncWrapper(async (req, res) => {
  const attachment = req.body
  const interview = await interviewService.addAttachment(req.user._id, req.params.id, attachment)
  res.json({
    success: true,
    message: 'Attachment added successfully',
    data: { interview },
  })
})

export const removeAttachment = asyncWrapper(async (req, res) => {
  const { url } = req.body
  const interview = await interviewService.removeAttachment(req.user._id, req.params.id, url)
  res.json({
    success: true,
    message: 'Attachment removed successfully',
    data: { interview },
  })
})

export const bulkAction = asyncWrapper(async (req, res) => {
  const { ids, action, data } = req.body
  const result = await interviewService.bulkAction(req.user._id, ids, action, data)
  res.json({
    success: true,
    message: result.message,
    data: null,
  })
})

// Preparation Center
export const addChecklistItem = asyncWrapper(async (req, res) => {
  const interview = await interviewService.addChecklistItem(req.user._id, req.params.id, req.body.item)
  res.status(201).json({
    success: true,
    message: 'Checklist item added',
    data: { interview },
  })
})

export const toggleChecklistItem = asyncWrapper(async (req, res) => {
  const { itemId, completed } = req.body
  const interview = await interviewService.toggleChecklistItem(req.user._id, req.params.id, itemId, completed)
  res.json({
    success: true,
    message: 'Checklist item updated',
    data: { interview },
  })
})

export const removeChecklistItem = asyncWrapper(async (req, res) => {
  const interview = await interviewService.removeChecklistItem(req.user._id, req.params.id, req.params.itemId)
  res.json({
    success: true,
    message: 'Checklist item removed',
    data: { interview },
  })
})

export const updatePreparation = asyncWrapper(async (req, res) => {
  const interview = await interviewService.updatePreparation(req.user._id, req.params.id, req.body)
  res.json({
    success: true,
    message: 'Preparation updated',
    data: { interview },
  })
})

// Interviewers
export const addInterviewer = asyncWrapper(async (req, res) => {
  const interview = await interviewService.addInterviewer(req.user._id, req.params.id, req.body)
  res.status(201).json({
    success: true,
    message: 'Interviewer added',
    data: { interview },
  })
})

export const removeInterviewer = asyncWrapper(async (req, res) => {
  const interview = await interviewService.removeInterviewer(req.user._id, req.params.id, req.params.interviewerId)
  res.json({
    success: true,
    message: 'Interviewer removed',
    data: { interview },
  })
})

// Calendar & Views
export const getCalendarInterviews = asyncWrapper(async (req, res) => {
  const { startDate, endDate } = req.query
  const interviews = await interviewService.getCalendarInterviews(req.user._id, startDate, endDate)
  res.json({
    success: true,
    message: 'Calendar interviews retrieved',
    data: { interviews },
  })
})

export const getUpcomingInterviews = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10
  const interviews = await interviewService.getUpcomingInterviews(req.user._id, limit)
  res.json({
    success: true,
    message: 'Upcoming interviews retrieved',
    data: { interviews },
  })
})

export const getTodayInterviews = asyncWrapper(async (req, res) => {
  const interviews = await interviewService.getTodayInterviews(req.user._id)
  res.json({
    success: true,
    message: "Today's interviews retrieved",
    data: { interviews },
  })
})

export const getPastInterviews = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10
  const interviews = await interviewService.getPastInterviews(req.user._id, limit)
  res.json({
    success: true,
    message: 'Past interviews retrieved',
    data: { interviews },
  })
})

export const getPendingFeedbackInterviews = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20
  const interviews = await interviewService.getPendingFeedbackInterviews(req.user._id, limit)
  res.json({
    success: true,
    message: 'Pending feedback interviews retrieved',
    data: { interviews },
  })
})

// Dashboard & Analytics
export const getDashboardStats = asyncWrapper(async (req, res) => {
  const stats = await interviewService.getDashboardStats(req.user._id)
  res.json({
    success: true,
    message: 'Dashboard stats retrieved',
    data: stats,
  })
})

export const getCompanyStats = asyncWrapper(async (req, res) => {
  const stats = await interviewService.getCompanyStats(req.user._id, req.params.companyId)
  res.json({
    success: true,
    message: 'Company interview stats retrieved',
    data: stats,
  })
})

export const getApplicationStats = asyncWrapper(async (req, res) => {
  const stats = await interviewService.getApplicationStats(req.user._id, req.params.applicationId)
  res.json({
    success: true,
    message: 'Application interview stats retrieved',
    data: stats,
  })
})

export const getCounts = asyncWrapper(async (req, res) => {
  const counts = await interviewService.getCounts(req.user._id)
  res.json({
    success: true,
    message: 'Counts retrieved',
    data: counts,
  })
})

export const getAnalytics = asyncWrapper(async (req, res) => {
  const analytics = await interviewService.getAnalytics(req.user._id)
  res.json({
    success: true,
    message: 'Analytics retrieved',
    data: analytics,
  })
})