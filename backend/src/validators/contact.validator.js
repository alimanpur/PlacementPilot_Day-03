import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject cannot exceed 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message cannot exceed 5000 characters'),
})
