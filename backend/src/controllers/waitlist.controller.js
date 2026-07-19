import { WaitlistRepository } from '../repositories/waitlist.repository.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'

const waitlistRepo = new WaitlistRepository()

export const joinWaitlist = asyncWrapper(async (req, res) => {
  const { email, name } = req.body

  const existing = await waitlistRepo.findByEmail(email)
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'You are already on the waitlist.',
      data: null,
    })
  }

  const entry = await waitlistRepo.create({
    email,
    name: name || '',
    source: req.body.source || 'pricing-page',
  })

  res.status(201).json({
    success: true,
    message: 'You are on the list. We will notify you when Pro opens.',
    data: { entry },
  })
})

export const getWaitlistStats = asyncWrapper(async (req, res) => {
  const count = await waitlistRepo.count()
  res.json({
    success: true,
    message: 'Waitlist stats retrieved',
    data: { count },
  })
})
