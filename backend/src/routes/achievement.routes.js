import { Router } from 'express'
import { getAllAchievements, createAchievement, deleteAchievement } from '../controllers/achievement.controller.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', getAllAchievements)
router.post('/', createAchievement)
router.delete('/:id', deleteAchievement)

export { router as achievementRouter }