import { Router } from 'express'
import {
  createApplication,
  getApplication,
  getApplications,
  updateApplication,
  deleteApplication,
  archiveApplication,
  restoreApplication,
  duplicateApplication,
  bulkAction,
  addNote,
  addAttachment,
  removeAttachment,
  getDashboardStats,
  getUpcomingDeadlines,
  getRecentApplications,
  getCounts,
} from '../controllers/application.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import {
  applicationSchema,
  applicationUpdateSchema,
  applicationBulkActionSchema,
} from '../validators/application.validator.js'

const router = Router()

router.use(authenticate)

router.post('/', validate(applicationSchema), createApplication)
router.get('/', getApplications)
router.get('/stats/dashboard', getDashboardStats)
router.get('/stats/counts', getCounts)
router.get('/deadlines/upcoming', getUpcomingDeadlines)
router.get('/recent', getRecentApplications)
router.get('/:id', getApplication)
router.put('/:id', validate(applicationUpdateSchema), updateApplication)
router.delete('/:id', deleteApplication)
router.patch('/:id/archive', archiveApplication)
router.patch('/:id/restore', restoreApplication)
router.post('/:id/duplicate', duplicateApplication)
router.post('/:id/notes', addNote)
router.post('/:id/attachments', addAttachment)
router.delete('/:id/attachments', removeAttachment)
router.post('/bulk', validate(applicationBulkActionSchema), bulkAction)

export { router as applicationRouter }
