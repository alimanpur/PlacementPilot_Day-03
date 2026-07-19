import { Router } from 'express'
import {
  getAllCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  archiveCompany,
  restoreCompany,
  toggleFavorite,
  addNote,
  addAttachment,
  removeAttachment,
  addTimeline,
  createRecruiter,
  getRecruiters,
  updateRecruiter,
  deleteRecruiter,
  createResource,
  getResources,
  updateResource,
  deleteResource,
  createHiringInfo,
  getHiringInfo,
  updateHiringInfo,
  deleteHiringInfo,
  getCompanyStats,
  updateCompanyStats,
  getFavoriteCompanies,
  getRecentCompanies,
  getUpcomingFollowUps,
} from '../controllers/company.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import {
  companySchema,
  companyIdSchema,
  recruiterSchema,
  resourceSchema,
  hiringInfoSchema,
} from '../validators/company.validator.js'

const router = Router()

router.use(authenticate)

// Company CRUD
router.get('/', getAllCompanies)
router.get('/stats', getCompanyStats)
router.get('/favorites', getFavoriteCompanies)
router.get('/recent', getRecentCompanies)
router.get('/follow-ups/upcoming', getUpcomingFollowUps)
router.get('/:id', getCompany)
router.post('/', createCompany)
router.put('/:id', updateCompany)
router.delete('/:id', deleteCompany)
router.patch('/:id/archive', archiveCompany)
router.patch('/:id/restore', restoreCompany)
router.patch('/:id/favorite', toggleFavorite)
router.post('/:id/stats/update', updateCompanyStats)

// Notes
router.post('/:id/notes', addNote)

// Attachments
router.post('/:id/attachments', addAttachment)
router.delete('/:id/attachments', removeAttachment)

// Timeline
router.post('/:id/timeline', addTimeline)

// Recruiters
router.post('/:id/recruiters', createRecruiter)
router.get('/:id/recruiters', getRecruiters)
router.put('/:id/recruiters/:recruiterId', updateRecruiter)
router.delete('/:id/recruiters/:recruiterId', deleteRecruiter)

// Resources
router.post('/:id/resources', validate(resourceSchema), createResource)
router.get('/:id/resources', getResources)
router.put('/:id/resources/:resourceId', validate(resourceSchema.partial()), updateResource)
router.delete('/:id/resources/:resourceId', deleteResource)

// Hiring Info
router.post('/:id/hiring-info', validate(hiringInfoSchema), createHiringInfo)
router.get('/:id/hiring-info', getHiringInfo)
router.put('/:id/hiring-info', validate(hiringInfoSchema.partial()), updateHiringInfo)
router.delete('/:id/hiring-info', deleteHiringInfo)

export { router as companyRouter }