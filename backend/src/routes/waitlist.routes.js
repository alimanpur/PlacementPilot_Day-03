import { Router } from 'express'
import { joinWaitlist, getWaitlistStats } from '../controllers/waitlist.controller.js'
import { validate } from '../middlewares/validate.js'
import { waitlistSchema } from '../validators/waitlist.validator.js'

const router = Router()

router.post('/', validate(waitlistSchema), joinWaitlist)
router.get('/stats', getWaitlistStats)

export { router as waitlistRouter }
