import { ProfileService } from '../services/profile.service.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'
import { UserRepository } from '../repositories/user.repository.js'

const profileService = new ProfileService()
const userRepo = new UserRepository()

export const getProfile = asyncWrapper(async (req, res) => {
  const user = await userRepo.findById(req.user._id)
  res.json({
    success: true,
    message: 'Profile retrieved',
    data: { user },
  })
})

export const updateProfile = asyncWrapper(async (req, res) => {
  const user = await userRepo.update(req.user._id, req.body)
  res.json({
    success: true,
    message: 'Profile updated',
    data: { user },
  })
})

export const getProfileSummary = asyncWrapper(async (req, res) => {
  const summary = await profileService.getProfileSummary(req.user._id)
  res.json({
    success: true,
    message: 'Profile summary retrieved',
    data: summary,
  })
})

export const getActivityTimeline = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50
  const activities = await profileService.getActivityTimeline(req.user._id, limit)
  res.json({
    success: true,
    message: 'Activity timeline retrieved',
    data: { activities },
  })
})

export const checkAchievements = asyncWrapper(async (req, res) => {
  const newAchievements = await profileService.checkAchievements(req.user._id)
  res.json({
    success: true,
    message: `Unlocked ${newAchievements.length} new achievements`,
    data: { achievements: newAchievements },
  })
})

export const getAchievements = asyncWrapper(async (req, res) => {
  const achievements = await profileService.getAchievements(req.user._id)
  res.json({
    success: true,
    message: 'Achievements retrieved',
    data: { achievements },
  })
})

export const getDocuments = asyncWrapper(async (req, res) => {
  const documents = await profileService.getDocuments(req.user._id)
  res.json({
    success: true,
    message: 'Documents retrieved',
    data: { documents },
  })
})

export const createDocument = asyncWrapper(async (req, res) => {
  const document = await profileService.createDocument(req.user._id, req.body)
  res.status(201).json({
    success: true,
    message: 'Document uploaded',
    data: { document },
  })
})

export const updateDocument = asyncWrapper(async (req, res) => {
  const document = await profileService.updateDocument(req.user._id, req.params.id, req.body)
  res.json({
    success: true,
    message: 'Document updated',
    data: { document },
  })
})

export const deleteDocument = asyncWrapper(async (req, res) => {
  await profileService.deleteDocument(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Document deleted',
    data: null,
  })
})

export const archiveDocument = asyncWrapper(async (req, res) => {
  const { archived } = req.body
  const document = await profileService.archiveDocument(req.user._id, req.params.id, archived)
  res.json({
    success: true,
    message: archived ? 'Document archived' : 'Document restored',
    data: { document },
  })
})

export const getSkills = asyncWrapper(async (req, res) => {
  const { category } = req.query
  const skills = await profileService.getSkills(req.user._id, category ? { category } : {})
  res.json({
    success: true,
    message: 'Skills retrieved',
    data: { skills },
  })
})

export const createSkill = asyncWrapper(async (req, res) => {
  const skill = await profileService.createSkill(req.user._id, req.body)
  res.status(201).json({
    success: true,
    message: 'Skill added',
    data: { skill },
  })
})

export const updateSkill = asyncWrapper(async (req, res) => {
  const skill = await profileService.updateSkill(req.user._id, req.params.id, req.body)
  res.json({
    success: true,
    message: 'Skill updated',
    data: { skill },
  })
})

export const deleteSkill = asyncWrapper(async (req, res) => {
  await profileService.deleteSkill(req.user._id, req.params.id)
  res.json({
    success: true,
    message: 'Skill removed',
    data: null,
  })
})
