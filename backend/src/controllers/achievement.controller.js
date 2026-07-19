import { AchievementRepository } from '../repositories/achievement.repository.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'

const achievementRepo = new AchievementRepository()

export const getAllAchievements = asyncWrapper(async (req, res) => {
  const achievements = await achievementRepo.findAll(req.user._id)
  res.json({
    success: true,
    message: 'Achievements retrieved',
    data: { achievements },
  })
})

export const createAchievement = asyncWrapper(async (req, res) => {
  const achievement = await achievementRepo.create(req.user._id, req.body)
  res.status(201).json({
    success: true,
    message: 'Achievement created',
    data: { achievement },
  })
})

export const deleteAchievement = asyncWrapper(async (req, res) => {
  const achievement = await achievementRepo.delete(req.user._id, req.params.id)
  if (!achievement) {
    return res.status(404).json({
      success: false,
      message: 'Achievement not found',
      data: null,
    })
  }
  res.json({
    success: true,
    message: 'Achievement deleted',
    data: null,
  })
})