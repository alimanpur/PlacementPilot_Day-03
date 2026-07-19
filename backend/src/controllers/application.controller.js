import { ApplicationService } from '../services/application.service.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'
import { validate } from '../middlewares/validate.js'
import {
  applicationSchema,
  applicationUpdateSchema,
  applicationIdSchema,
  applicationBulkActionSchema,
  applicationFilterSchema,
} from '../validators/application.validator.js'

const applicationService = new ApplicationService()

export const createApplication = asyncWrapper(async (req, res) => {
  const application = await applicationService.createApplication(req.user._id, req.body)
  res.status(201).json({
    success: true,
    message: 'Application created successfully',
    data: { application },
  })
})

export const getApplication = asyncWrapper(async (req, res) => {
  const application = await applicationService.getApplication(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Application retrieved',
    data: { application },
  })
})

export const getApplications = asyncWrapper(async (req, res) => {
  const filters = req.query
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    sortBy: req.query.sortBy || 'createdAt',
    sortOrder: req.query.sortOrder || 'desc',
    search: req.query.search || '',
  }

  const result = await applicationService.getApplications(req.user._id, filters, options)
  res.json({
    success: true,
    message: 'Applications retrieved',
    data: result,
  })
})

export const updateApplication = asyncWrapper(async (req, res) => {
  const application = await applicationService.updateApplication(req.user._id, req.params.id, req.body)
  res.json({
    success: true,
    message: 'Application updated successfully',
    data: { application },
  })
})

export const deleteApplication = asyncWrapper(async (req, res) => {
  const result = await applicationService.deleteApplication(req.user._id, req.params.id)
  res.json({
    success: true,
    message: result.message,
    data: null,
  })
})

export const archiveApplication = asyncWrapper(async (req, res) => {
  const { archived } = req.query
  const result = await applicationService.archiveApplication(req.user._id, req.params.id, archived !== 'false')
  res.json({
    success: true,
    message: result.message,
    data: null,
  })
})

export const restoreApplication = asyncWrapper(async (req, res) => {
  const result = await applicationService.restoreApplication(req.user._id, req.params.id)
  res.json({
    success: true,
    message: result.message,
    data: null,
  })
})

export const duplicateApplication = asyncWrapper(async (req, res) => {
  const application = await applicationService.duplicateApplication(req.user._id, req.params.id)
  res.status(201).json({
    success: true,
    message: 'Application duplicated successfully',
    data: { application },
  })
})

export const bulkAction = asyncWrapper(async (req, res) => {
  const { ids, action, data } = req.body
  const result = await applicationService.bulkAction(req.user._id, ids, action, data)
  res.json({
    success: true,
    message: result.message,
    data: null,
  })
})

export const addNote = asyncWrapper(async (req, res) => {
  const { note } = req.body
  const application = await applicationService.addNote(req.user._id, req.params.id, note)
  res.json({
    success: true,
    message: 'Note added successfully',
    data: { application },
  })
})

export const addAttachment = asyncWrapper(async (req, res) => {
  const attachment = req.body
  const application = await applicationService.addAttachment(req.user._id, req.params.id, attachment)
  res.json({
    success: true,
    message: 'Attachment added successfully',
    data: { application },
  })
})

export const removeAttachment = asyncWrapper(async (req, res) => {
  const { url } = req.body
  const application = await applicationService.removeAttachment(req.user._id, req.params.id, url)
  res.json({
    success: true,
    message: 'Attachment removed successfully',
    data: { application },
  })
})

export const getDashboardStats = asyncWrapper(async (req, res) => {
  const stats = await applicationService.getDashboardStats(req.user._id)
  res.json({
    success: true,
    message: 'Dashboard stats retrieved',
    data: stats,
  })
})

export const getUpcomingDeadlines = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10
  const deadlines = await applicationService.getUpcomingDeadlines(req.user._id, limit)
  res.json({
    success: true,
    message: 'Upcoming deadlines retrieved',
    data: { deadlines },
  })
})

export const getRecentApplications = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10
  const applications = await applicationService.getRecentApplications(req.user._id, limit)
  res.json({
    success: true,
    message: 'Recent applications retrieved',
    data: { applications },
  })
})

export const getCounts = asyncWrapper(async (req, res) => {
  const counts = await applicationService.getCounts(req.user._id)
  res.json({
    success: true,
    message: 'Counts retrieved',
    data: counts,
  })
})