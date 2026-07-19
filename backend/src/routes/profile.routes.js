import { Router } from 'express'
import {
  getProfileSummary,
  getActivityTimeline,
  checkAchievements,
  getAchievements,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  archiveDocument,
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/profile.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { documentSchema, skillSchema } from '../validators/profile.validator.js'

const router = Router()

router.use(authenticate)

router.get('/summary', getProfileSummary)

// Activity
router.get('/activity', getActivityTimeline)

// Achievements
router.get('/achievements', getAchievements)
router.post('/achievements/check', checkAchievements)

// Documents
router.get('/documents', getDocuments)
router.post('/documents', validate(documentSchema), createDocument)
router.put('/documents/:id', validate(documentSchema), updateDocument)
router.delete('/documents/:id', deleteDocument)
router.patch('/documents/:id/archive', archiveDocument)

// Skills
router.get('/skills', getSkills)
router.post('/skills', validate(skillSchema), createSkill)
router.put('/skills/:id', validate(skillSchema), updateSkill)
router.delete('/skills/:id', deleteSkill)

export { router as profileRouter }
