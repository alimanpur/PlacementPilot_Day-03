import { Router } from 'express'
import { submitContact } from '../controllers/contact.controller.js'
import { validate } from '../middlewares/validate.js'
import { contactSchema } from '../validators/contact.validator.js'

const router = Router()

router.post('/', validate(contactSchema), submitContact)

export { router as contactRouter }
