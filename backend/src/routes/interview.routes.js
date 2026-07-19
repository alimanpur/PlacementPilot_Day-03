import { Router } from 'express'
import {
  createInterview,
  getInterview,
  getInterviews,
  updateInterview,
  deleteInterview,
  archiveInterview,
  restoreInterview,
  duplicateInterview,
  rescheduleInterview,
  cancelInterview,
  completeInterview,
  submitFeedback,
  addNote,
  addAttachment,
  removeAttachment,
  bulkAction,
  addChecklistItem,
  toggleChecklistItem,
  removeChecklistItem,
  updatePreparation,
  addInterviewer,
  removeInterviewer,
  getCalendarInterviews,
  getUpcomingInterviews,
  getTodayInterviews,
  getPastInterviews,
  getPendingFeedbackInterviews,
  getDashboardStats,
  getCompanyStats,
  getApplicationStats,
  getCounts,
  getAnalytics,
} from '../controllers/interview.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import {
  interviewSchema,
  interviewUpdateSchema,
  interviewScheduleSchema,
  interviewFeedbackSchema,
  interviewBulkActionSchema,
  interviewAddInterviewerSchema,
  interviewPreparationItemSchema,
} from '../validators/interview.validator.js'

const router = Router()

router.use(authenticate)

// CRUD
router.post('/', validate(interviewSchema), createInterview)
router.get('/', getInterviews)
router.get('/analytics', getAnalytics)
router.get('/stats/dashboard', getDashboardStats)
router.get('/stats/counts', getCounts)
router.get('/upcoming', getUpcomingInterviews)
router.get('/today', getTodayInterviews)
router.get('/past', getPastInterviews)
router.get('/calendar', getCalendarInterviews)
router.get('/pending-feedback', getPendingFeedbackInterviews)
router.get('/company/:companyId/stats', getCompanyStats)
router.get('/application/:applicationId/stats', getApplicationStats)
router.get('/:id', getInterview)
router.put('/:id', validate(interviewUpdateSchema), updateInterview)
router.delete('/:id', deleteInterview)
router.patch('/:id/archive', archiveInterview)
router.patch('/:id/restore', restoreInterview)
router.post('/:id/duplicate', duplicateInterview)
router.post('/:id/reschedule', validate(interviewScheduleSchema), rescheduleInterview)
router.post('/:id/cancel', cancelInterview)
router.post('/:id/complete', completeInterview)
router.post('/:id/feedback', validate(interviewFeedbackSchema), submitFeedback)
router.post('/:id/notes', addNote)
router.post('/:id/attachments', addAttachment)
router.delete('/:id/attachments', removeAttachment)

// Preparation Center
router.post('/:id/preparation/checklist', validate(interviewPreparationItemSchema), addChecklistItem)
router.patch('/:id/preparation/checklist/toggle', toggleChecklistItem)
router.delete('/:id/preparation/checklist/:itemId', removeChecklistItem)
router.put('/:id/preparation', updatePreparation)

// Interviewers
router.post('/:id/interviewers', validate(interviewAddInterviewerSchema), addInterviewer)
router.delete('/:id/interviewers/:interviewerId', removeInterviewer)

// Bulk Actions
router.post('/bulk', validate(interviewBulkActionSchema), bulkAction)

export { router as interviewRouter }