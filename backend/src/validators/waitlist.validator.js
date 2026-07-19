import { z } from 'zod'

export const waitlistSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  name: z.string().optional(),
  source: z.string().optional(),
})
