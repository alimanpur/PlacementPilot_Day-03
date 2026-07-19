import { Router } from 'express'
import {
  getAllGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from '../controllers/goal.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { goalSchema, goalUpdateSchema } from '../validators/goal.validator.js'

const router = Router()

router.use(authenticate)

router.get('/', getAllGoals)
router.post('/', validate(goalSchema), createGoal)
router.put('/:id', validate(goalUpdateSchema), updateGoal)
router.delete('/:id', deleteGoal)

export { router as goalRouter }