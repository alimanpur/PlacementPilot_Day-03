import { GoalRepository } from '../repositories/goal.repository.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'

const goalRepo = new GoalRepository()

export const getAllGoals = asyncWrapper(async (req, res) => {
  const goals = await goalRepo.findAll(req.user._id)
  res.json({
    success: true,
    message: 'Goals retrieved',
    data: { goals },
  })
})

export const createGoal = asyncWrapper(async (req, res) => {
  const goal = await goalRepo.create(req.user._id, req.body)
  res.status(201).json({
    success: true,
    message: 'Goal created',
    data: { goal },
  })
})

export const updateGoal = asyncWrapper(async (req, res) => {
  const goal = await goalRepo.update(req.user._id, req.params.id, req.body)
  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found',
      data: null,
    })
  }
  res.json({
    success: true,
    message: 'Goal updated',
    data: { goal },
  })
})

export const deleteGoal = asyncWrapper(async (req, res) => {
  const goal = await goalRepo.delete(req.user._id, req.params.id)
  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found',
      data: null,
    })
  }
  res.json({
    success: true,
    message: 'Goal removed',
    data: null,
  })
})
