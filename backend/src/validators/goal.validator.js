import { z } from 'zod'

export const goalSchema = z.object({
  title: z.string().min(1, 'Goal title is required').max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(['daily', 'weekly', 'monthly', 'target_company', 'solved_problems', 'interview', 'application', 'custom']).optional(),
  progress: z.number().min(0).max(100).optional(),
  target: z.number().min(0).optional(),
  current: z.number().min(0).optional(),
  unit: z.string().optional(),
  deadline: z.coerce.date().optional(),
  cadence: z.string().optional(),
  tone: z.enum(['brand', 'accent', 'muted']).optional(),
  milestones: z.array(z.object({
    title: z.string(),
    target: z.number(),
    current: z.number(),
    unit: z.string(),
    completed: z.boolean().optional(),
  })).optional(),
  status: z.enum(['active', 'completed', 'cancelled', 'paused']).optional(),
})

export const goalUpdateSchema = goalSchema.partial()


